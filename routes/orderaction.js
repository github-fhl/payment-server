const
  common = require('./../component/common')
  , util = require('./../component/util')
  , models  = require('../models').models
  , dl = require('debug')('orderaction:log')
  , de = require("debug")('orderaction:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , rbac = require('../component/accesscheck').rbac
  , fn = require('../component/fn')
  , generatorId = fn.generatorId
  , decorateCondition = fn.decorateCondition
  , getData = fn.getData
  , appcfg = require('../component/appcfg')
  , idType = appcfg.idType
  , operation = appcfg.operation
  , category = appcfg.category
  , roles = appcfg.roles
  , approType = appcfg.approType
  , rejectArr = appcfg.rejectArr
  , moment = require('moment')
  , clone = require('clone')
  , orderdetail = require('./orderdetail')
  , FSM = require('./machine/index').FSM
  , order = require('./order')
  , handleFsmError = fn.handleFsmError
  , transitions = require('./machine/index').transitions
  ;

//提交时，触动状态机方法提交方法

/**
 * 规则：
 *    批量操作的 operation 需要验证
 *    拒绝操作需要对 remark 进行验证
 *    最后已付款操作时，需要对 subjectId 进行验证
 *    已付款操作时，需 paidNo 进行验证，不能跳号，不能重复
 *
 * 操作：
 *    撤回操作不在流程中
 *
 * @param req
 * @param res
 */
exports.action = (req, res) =>{

  let run = async ()=>{
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'idArr', null, true, null) &&
      common.getreqparameter(req, res, args, 'rejectRemark', null, false, null) &&
      common.getreqparameter(req, res, args, 'paidNo', null, false, null) &&
      common.getreqparameter(req, res, args, 'paidDate', null, false, null) &&
      common.getreqparameter(req, res, args, 'subjectId', null, false, null)
    ){
      return sequelize.transaction(async(t)=>{
        let action = req.url.split('/')[1];
        /*** 撤销操作 */
        if (action === appcfg.backout) {
          return await backoutOrder(req, args.idArr, t)
        }

        if (Object.keys(operation).remove([operation.create]).indexOf(action) === -1) throw new Error(5);
        if (appcfg.bulkOperation.indexOf(action) === -1 && args.idArr.length !== 1) throw new Error(308);
        if (rejectArr.remove([operation.cashierPayFailed]).indexOf(action) !== -1 && (!args.rejectRemark || args.idArr.length !== 1)) throw new Error(307);
        if (action === operation.cashierPaySucceed) {
          if (!args.subjectId) throw new Error(309);
          let c_subject = await models.subject.findOne({where: {id: args.subjectId}});
          if (!c_subject) throw new Error(`3,${args.subjectId}`);
          if (!args.paidDate) throw new Error(311);

          args.subjectDate = moment(args.paidDate).format('YYMM');

          if (args.idArr.length !== Object.keys(args.paidNo).length) throw new Error(310);

          let maxPaidNo = await order.findPaidNoMax(args.subjectDate, t, c_subject.dataValues.bankCode, c_subject.dataValues.accountType);
          let maxNum = parseInt(maxPaidNo.slice(-3));
          let shouldPaidNoArr = [];

          // 生成应有的顺序
          for (let i = 0; i < args.idArr.length; i++){
            shouldPaidNoArr.push(maxNum + i + 1);
          }
          console.log('shouldPaidNoArr: ',shouldPaidNoArr);

          // 获取前端传递的顺序
          let paidNoArr = [];
          for (let key in args.paidNo){
            paidNoArr.push(parseInt(args.paidNo[key].slice(-3)));

            // 检查对应的 company code 是否正确
            let c_orderCompany = await models.order.findOne({
              where: {id: key},
              transaction: t,
              include: [{
                model: models.company,
                attributes: ['code']
              }]
            });
            if (!c_orderCompany) throw new Error(`3,${key}`);
            if (c_orderCompany.company.dataValues.code !== args.paidNo[key].slice(0, 2)) throw new Error(`314,${key}`);

            // 检查对应的 accountType 是否正确
            if (c_subject.dataValues.accountType !== args.paidNo[key].slice(9, 11))
              throw new Error(`315,${key}`);

            // 检查对应的 bankCode 是否正确
            if (c_subject.dataValues.bankCode !== args.paidNo[key].slice(6, 8)) throw new Error(`316,${key}`);
          }
          console.log('paidNoArr: ',paidNoArr);
          shouldPaidNoArr.forEach((item) => {
            if (paidNoArr.indexOf(item) === -1) throw new Error(`312,流水号：${item}`);
          })
        }

        for (let i = 0, len = args.idArr.length; i < len; i++){
          if (action === operation.cashierPaySucceed && (!args.paidNo[args.idArr[i]])) throw new Error(310);
          let c_order = await models.order.findOne({where: {id: args.idArr[i]}, transaction: t});
          if (!c_order) throw new Error(`3,order--${args.idArr[i]}`);

          /*** 提交审批给预设定主管/总监 **/
          if (action === appcfg.operation.submit){
            if (c_order.amount < appcfg.gapMoney){
              if (!req.user.managerUsr) throw new Error(110);
              args.accountId = req.user.managerUsr
            } else {
              if (!req.user.directorUsr) throw new Error(110);
              args.accountId = req.user.directorUsr
            }
          }

          console.log('action: ', action);
          let parameter = {
            req: req,
            order: c_order,
          };
          let fsm = await new FSM(parameter);
          await handleFsmError(fsm, 'initialize', c_order.dataValues.approStatus);

          let actualAction = action;
          if (action === operation.cashierExport) {
            if (c_order.approStatus === 'updatedByApplicant') actualAction = operation.cashierExportAgain
          }

          console.log('actualAction: ', actualAction);
          let parameters = [fsm, actualAction, t];
          let transition = transitions.filter((item)=>{
            return item.name === actualAction
          })[0];
          switch (transition.approType){
            case approType.byAccount:
              if (actualAction === operation.submit){
                if (!common.isExist(args.accountId)) throw new Error(302);
                parameters.push(approType.byAccount, args.accountId, args.rejectRemark);
              }else{
                parameters.push(approType.byAccount, c_order.dataValues.createdUsr, args.rejectRemark);
              }
              break;
            default:
              parameters.push(approType.byRole, transition.toRole, args.rejectRemark, args.subjectId);
              if (actualAction === operation.cashierPaySucceed) parameters.push(args.paidNo[args.idArr[i]], args.paidDate);
              break;
          }
          await handleFsmError.apply(fn, parameters);
        }
      })
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

/**
 * 规则：
 *    检查 orderArr 是否只有一个
 *    检查操作人是否为 order 创建人
 *    检查 order 是否为待主管审批状态
 *    检查 order 的applylog有多少条，如果只有两条，则表明是第一次提交；如果有多条，则表明有多次提交，中间有被退回
 *
 * 操作：
 *    将 order 对应的提交审批的 applylog 删除
 *    将 order 的状态变更为前一个状态
 *    将之前的 applylog 的状态变更为 toHandle
 *
 * @param req
 * @param orderArr
 * @param t
 * @return {Promise.<void>}
 */
async function backoutOrder(req, orderArr, t) {
  if (orderArr.length !== 1) throw new Error(308);
  let c_order = await models.order.findOne({
    where: {id: orderArr[0]},
    transaction: t,
    include: [{
      model: models.applylog,
      separate: true,
      order: [['createdAt', 'DESC']]
    }]
  });
  if (!c_order) throw new Error(`3,${orderArr[0]}`);
  if (c_order.dataValues.createdUsr !== req.user.id) throw new Error(301);
  if (c_order.dataValues.approStatus !== appcfg.approStatus.toApproByManager) throw new Error(305);

  if (c_order.applylogs.length >= 2){
    if (c_order.applylogs[0].dataValues.applyStatus !== appcfg.applyStatus.toHandle || c_order.applylogs[0].dataValues.operation !== operation.submit) throw new Error(7);
    if (c_order.applylogs[1].dataValues.applyStatus !== appcfg.applyStatus.handled) throw new Error(7);
    transitions.forEach((item) => {
      if (item.name === c_order.applylogs[1].dataValues.operation) c_order.approStatus = item.to;
    });

    c_order.applylogs[1].applyStatus = appcfg.applyStatus.toHandle;
    await c_order.applylogs[1].save({transaction: t});
    await models.applylog.destroy({
      where: {applyStatus: appcfg.applyStatus.toHandle, orderId: orderArr[0], operation: operation.submit},
      transaction: t
    });
    await c_order.save({transaction: t});

  }
  else throw new Error(7);

}