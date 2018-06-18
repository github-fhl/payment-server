const
  common = require('../../component/common')
  , util = require('../../component/util')
  , models  = require('../../models/index').models
  , dl = require('debug')('order:log')
  , de = require("debug")('order:error')
  , sequelize  = require('../../models/index').sequelize
  , Sequelize  = require('../../models/index').Sequelize
  , rbac = require('../../component/accesscheck').rbac
  , fn = require('../../component/fn')
  , generatorId = fn.generatorId
  , decorateCondition = fn.decorateCondition
  , getData = fn.getData
  , checkRole = fn.checkRole
  , appcfg = require('../../component/appcfg')
  , idType = appcfg.idType
  , operation = appcfg.operation
  , approType = appcfg.approType
  , applyStatus = appcfg.applyStatus
  , roles = appcfg.roles
  , approStatus = appcfg.approStatus
  , moment = require('moment')
  , clone = require('clone')
  , orderdetail = require('../orderdetail')
  , StateMachine = require('javascript-state-machine')
  , onCashierPaySucceed = require('./onCashierPaySucceed')
  ;


// 触动状态机变化时，需要发动通知：
  // 批准：通知下一个人
  //todo 拒绝：通知前面所有人



//todo 废弃申请单只能在未提交、被否决的状态下废弃

const transitions = [
  { name: `${operation.create}`,  from: ['none', 'toSubmit'],  to: 'toSubmit' , toRole: null, approType: approType.byAccount},
  { name: `${operation.submit}`,  from: ['toSubmit', 'refusedByManager', 'refusedByCashier', 'refusedByFinance', 'refusedByChief'],  to: 'toApproByManager' , toRole: null, approType: approType.byAccount},

  { name: `${operation.managerAppro}`,  from: 'toApproByManager',  to: 'toApproByCashier', toRole: 'cashier', approType: approType.byRole, role: 'manager'},
  { name: `${operation.managerRefuse}`,  from: 'toApproByManager',  to: 'refusedByManager', toRole: null, approType: approType.byAccount, role: 'manager' },

  { name: `${operation.cashierAppro}`, from: 'toApproByCashier', to: 'toApproByFinance', toRole: 'finance', approType: approType.byRole, role: 'cashier'},
  { name: `${operation.cashierRefuse}`, from: 'toApproByCashier', to: 'refusedByCashier', toRole: null, approType: approType.byAccount, role: 'cashier' },

  { name: `${operation.financeAppro}`, from: 'toApproByFinance', to: 'toApproByChief', toRole: 'chief', approType: approType.byRole, role: 'finance'},
  { name: `${operation.financeRefuse}`, from: 'toApproByFinance', to: 'refusedByFinance', toRole: null, approType: approType.byAccount, role: 'finance' },

  { name: `${operation.chiefAppro}`, from: ['toApproByFinance', 'toApproByChief'], to: 'toExportByCashier', toRole: 'cashier', approType: approType.byRole, role: 'chief'},  //可以跳过财务，直接由总监进行批准
  { name: `${operation.chiefRefuse}`, from: 'toApproByChief', to: 'refusedByChief' , toRole: null, approType: approType.byAccount, role: 'chief'},

  { name: `${operation.cashierExport}`, from: ['toExportByCashier'], to: 'toPayByCashier', toRole: 'cashier', approType: approType.byRole, role: 'cashier'},
  { name: `${operation.cashierExportAgain}`, from: ['updatedByApplicant'], to: 'paySucceed', toRole: null, approType: approType.byRole, role: 'cashier'}, //由用户已修改信息状态进行导出操作

  { name: `${operation.cashierPaySucceed}`, from: 'toPayByCashier', to: 'paySucceed', toRole: null, approType: null, role: 'cashier' },  //流程结束
  { name: `${operation.cashierPayFailed}`, from: 'paySucceed', to: 'payFailed', toRole: null, approType: approType.byAccount, role: 'cashier'},

  { name: `${operation.applicantUpdate}`, from: 'payFailed', to: 'updatedByApplicant', toRole: 'cashier', approType: approType.byRole},

  { name: `${operation.abandon}`, from: ['toSubmit', 'refusedByManager', 'refusedByCashier', 'refusedByFinance', 'refusedByChief'], to: 'abandoned' , toRole: null, approType: null},  //流程结束
  { name: 'goto', from: '*', to: function(s) { return s } }
];
exports.transitions = transitions;

const FSM = StateMachine.factory({
  transitions: transitions,
  data: function(parameter) {
    return {
      req: parameter.req,
      order: parameter.order.dataValues,
    }
  },
  methods: {
    initialize: function (initState) {
      return new Promise(async (resolve, reject)=> {
        this.goto(initState);
        resolve();
      })
    },

    //主管批准、拒绝时：
    // 检查主管审批人，是否为当前被提交的主管
    checkLog: async function (t) {
      let c_log = await models.applylog.findOne({
        where: {orderId: this.order.id, applyStatus: applyStatus.toHandle},
        transaction: t
      });
      if (!c_log) throw new Error(`3,申请单(${this.order.id})的applylog`);
      if (this.req.user.id !== c_log.dataValues.toHandleUsr) throw new Error(306);
    },

    /**
     * 检查员工是否含有该权限
     * @param action
     * @param t
     * @param approType
     * @param toHandleId
     */
    onBeforeTransition: function (action, t, approType, toHandleId) {
      return new Promise(async (resolve, reject)=>{
        try{
          let ignore = [operation.create, operation.submit, operation.abandon, operation.applicantUpdate, 'goto'];
          let checkTransition = Object.keys(operation).remove(ignore);
          if (checkTransition.indexOf(action.transition) + 1){
            let roleName = transitions.filter((item)=>{
              return item.name == action.transition
            })[0].role;
            if (!(await checkRole(this.req.user.id, roleName, t))) throw new Error(`303,${roleName}`);
          }
          resolve();
        }catch (err){
          reject(err)
        }
      })
    },


    /**
     * 规则：
     *
     *    在每个transition结束后（除了create），都需要将前一条applylog的状态从toHandle改为handled，即前一个操作的applylog
     *    创建对应的applylog，除了abandon和cashierPaySucceed
     *    更新对应的order状态
     *    已付款时，需要对应的保存paidNo
     *    已付款时需要创建对应的银行科目
     *
     * @param action
     * @param t
     * @param approType
     * @param toHandleId
     * @param rejectRemark
     * @param subjectId
     * @param paidNo
     * @param paidDate
     */
    //在每个transition结束后（除了create），都需要将前一条applylog的状态从toHandle改为handled，即前一个操作的applylog
    //创建对应的applylog，除了abandon和cashierPaySucceed
    //更新对应的order状态
    //已付款时，需要对应的保存paidNo
    onAfterTransition: function (action, t, approType, toHandleId, rejectRemark, subjectId, paidNo, paidDate) {
      return new Promise(async (resolve, reject)=>{
        try{
          if (action.transition === 'goto') return resolve();

          /**
           * 对操作人进行check，onBeforeTransiton 的执行顺序在检查state的前面，所以这些检查不能放在onBeforeTransition函数中
           */
          switch (action.transition){

            //提交时：检查提交人是否为创建人
            //检查通知的人是否有主管的角色
            case operation.submit:
              if (this.req.user.id !== this.order.createdUsr) throw new Error(`301,${action.transition}`);
              if (!(await checkRole(toHandleId, appcfg.roles.manager, t))) throw new Error(`303,待审批的员工`);
              break;

            //主管批准、拒绝：
            // 检查主管审批人，是否为当前被提交的主管
            case operation.managerAppro:
            case operation.managerRefuse:
              await this.checkLog(t);
              break;

            //废弃时需要检查，删除人是否为创建人
            case operation.abandon:
              if (this.req.user.id !== this.order.createdUsr) throw new Error(`301,${action.transition}`);
              break;

          }

          console.log('before check is over!');

          /************************************************ *********************************************************/


          // 更新create/payFaild 操作外的前一条applylog，create、payFaild 没有前一条log

          if (action.transition !== operation.create && action.transition !== operation.cashierPayFailed){
            let prevOperation = transitions.filter((item)=>{
              return item.to === action.from
            })[0].name;
            let cdn = {
              where: {orderId: this.order.id, applyStatus: applyStatus.toHandle, operation: prevOperation},
              transaction: t
            };
            switch (approType){
              case appcfg.approType.byAccount:
                cdn.toHandleUsr = toHandleId;
                // cdn.approType= approType;
                break;
              case appcfg.approType.byRole:
                cdn.toHandleRole = toHandleId;
                // cdn.approType= approType;
                break;
            }
            let c_applylog = await models.applylog.findOne(cdn);
            console.log('action.transition: ', action.transition);
            if (!c_applylog) throw new Error(304);
            c_applylog.applyStatus = applyStatus.handled;
            c_applylog.save({transaction: t});
          }

          //创建新的log，
          // 当为abandon和cashierPaySucceed时，状态为 handled
          let log = {
            operation: action.transition,
            operator: this.req.user.id,
            orderId: this.order.id,
            remark: rejectRemark,
          };
          // 为了在创建并提交时，提交对应的 log 的创建时间晚于创建的 log 的创建时间
          if(action.transition === operation.submit) log.createdAt = moment().add(2, 's');
          switch (approType){
            case appcfg.approType.byAccount:
              log.toHandleUsr = toHandleId;
              log.approType= approType;
              break;
            case appcfg.approType.byRole:
              log.toHandleRole = toHandleId;
              log.approType= approType;
              break;
          }
          if (action.transition === operation.abandon || action.transition === operation.cashierPaySucceed){
            log.applyStatus = appcfg.applyStatus.handled
          }
          await models.applylog.create(log, {transaction: t});

          let orderUpdate = {
            approStatus: action.to, updatedUsr: this.req.user.id
          };
          /*** 废弃操作后，是否需要显示已废弃的 order *****************************/
          // if (action.transition === operation.abandon) orderUpdate.status = 0;

          /*** 最后付款成功后，需要在vendor的银行账户详情中的payDate，更新最后的成功日期；在order中更新paidDate  ***/
          /*** 付款成功时，需要选择对应的银行科目，然后创建一条科目 ***/
          /*** 付款成功时，需要填入对应的付款号 paidNo ***/
          if (action.transition === operation.cashierPaySucceed){
            orderUpdate.paidDate = paidDate;
            orderUpdate.paidNo = paidNo;
            orderUpdate.subjectDate = moment(paidDate).format('YYMM');
            let c_order = await models.order.findOne({
              transaction: t,
              where: {id: this.order.id},

              include: [{
                model: models.orderdetail,
                where: {status: 1},
                required: false,

                include: [{
                  required: true,
                  model: models.vendor,

                  include: [{
                    required: true,
                    model: models.vendordetail,
                    where: {status: 1, bankNum: {$eq: sequelize.col('orderdetails.bankNum')}}
                  }]
                }]
              }]
            });
            for (let i = 0, len = c_order.orderdetails.length; i < len; i++){
              let detail = c_order.orderdetails[i];
              if (detail && detail.vendor && detail.vendor.vendordetails[0]){
                detail.vendor.vendordetails[0].payDate = new Date();
                await detail.vendor.vendordetails[0].save({transaction: t});
              }
            }

            let orderSubject = {
              orderId: this.order.id,
              subjectId: subjectId,
              type: appcfg.subjectType.credit,
              money: this.order.amount
            };
            await models.ordersubject.create(orderSubject, {transaction: t});
          }
          await models.order.update(orderUpdate, {
            where: {id: this.order.id}, transaction: t
          });
          console.log('after all resolved!');
          resolve();

        }catch(err){
          reject(err)
        }
      })
    },

    onCashierPaySucceed,
  }
});


exports.FSM = FSM;








//当前审批状态
/**
 *
 exports.approStatus = {
  toSubmit: 'toSubmit',  //已创建，待提交
  toApproByManager: 'toApproByManager',  //已提交，待主管审批
  refusedByManager: 'refusedByManager',  //主管否决，待提交
  toApproByCashier: 'toApproByCashier',  //主管已批准，待出纳审核
  refusedByCashier: 'refusedByCashier',  //出纳否决，待提交
  toApproByFinance: 'toApproByFinance',  //出纳已审核，待财务审核
  refusedByFinance: 'refusedByFinance',  //财务否决，待提交
  toApproByChief: 'toApproByChief',  //财务已审核，待财务总监审批
  refusedByChief: 'refusedByChief',  //财务总监否决，待提交
  toExportByCashier: 'toExportByCashier',  //财务总监已审批，待出纳导出
  toPayByCashier: 'toPayByCashier',  //出纳已导出，待出纳付款
  payFailed: 'payFailed',  //出纳付款失败，待出纳导出
  paySucceed: 'paySucceed',  //出纳付款成功
  abandoned: 'abandoned'  //已废弃
};

 */
