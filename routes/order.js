const
  common = require('./../component/common')
  , util = require('./../component/util')
  , tools = require('./../component/tools')
  , models  = require('../models').models
  , dl = require('debug')('order:log')
  , de = require("debug")('order:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , rbac = require('../component/accesscheck').rbac
  , fn = require('../component/fn')
  , generatorId = fn.generatorId
  , decorateCondition = fn.decorateCondition
  , getData = fn.getData
  , checkRole = fn.checkRole
  , getRoles = fn.getRoles
  , handleFsmError = fn.handleFsmError
  , appcfg = require('../component/appcfg')
  , idType = appcfg.idType
  , removeAttrs = appcfg.removeAttrs
  , category = appcfg.category
  , operation = appcfg.operation
  , applyStatus = appcfg.applyStatus
  , roles = appcfg.roles
  , approStatus = appcfg.approStatus
  , approType = appcfg.approType
  , moment = require('moment')
  , clone = require('clone')
  , orderdetail = require('./orderdetail')
  , FSM = require('./machine/index').FSM
  , transitions = require('./machine/index').transitions
  , {cfg} = require('config')
  , {currency, orderType} = cfg
  , {ExpenseMachine} = require('../src/service/expenseStateMachine')
  , {OrderMachine} = require('../src/service/orderStateMachine')
  ;

// 出纳在最后确认时，需要能够修改金额
exports.cashierUpdateAmount = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'id', null, true, null) &&
      common.getreqparameter(req, res, args, 'details', null, true, null)
    ){
      return await sequelize.transaction(async (t)=> {
        let $order = await models.order.findOne({
          where: {id: args.id},
          transaction: t
        })

        let sum = 0

        for (let i = 0; i < args.details.length; i++ ){
          await models.orderdetail.update({
            money: args.details[i].money
          }, {
            where: {id: args.details[i].id},
            transaction: t
          })

          sum += parseFloat(args.details[i].money)
        }

        await models.order.update({
          amount: sum,
          subjectStatus: $order.subjectStatus === appcfg.y ? appcfg.f : appcfg.n
        }, {
          where: {id: args.id},
          transaction: t
        })

        // 更新对应的贷方科目金额
        await models.ordersubject.update({
          money: sum
        }, {
          where: {orderId: args.id, type: appcfg.subjectType.credit},
          transaction: t
        })
      })
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {order: obj}) )
    .catch(common.catchsendmessage(req, res))
}

/**
 * 获取当月最新的 paidNo
 *
 * 参数- paidDate -- 201703
 * @param req
 * @param res
 */
exports.getPaidNo = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'subjectDate', null, true, null) &&
      common.getreqparameter(req, res, args, 'subjectId', null, true, null)
    ){

      let c_subject = await models.subject.findOne({where: {id: args.subjectId}});
      if (!c_subject) throw new Error(`3,${args.subjectId}`);
      if (c_subject.dataValues.bankFlag !== appcfg.y) throw new Error(`313,${c_subject.dataValues.name}`);
      if (!c_subject.dataValues.bankCode) throw new Error(`216,${c_subject.dataValues.name}`);
      if (!c_subject.dataValues.accountType) throw new Error(`217,${c_subject.dataValues.name}`);
      return await exports.findPaidNoMax(args.subjectDate, null, c_subject.dataValues.bankCode, c_subject.dataValues.accountType)
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {order: obj}))
    .catch(common.catchsendmessage(req, res))
};

/**
 *
 * 规则：
 *    每个银行都有自己的一套流水号
 *
 * @param date
 * @param t
 * @param bankCode 银行代号
 * @param accountType 账号类别
 * @return {Promise.<*>}
 */
exports.findPaidNoMax = async (date, t, bankCode, accountType) => {
  let c_order = await models.order.findOne({
    where: {
      $and: [
        sequelize.where(sequelize.literal('substring(paidNo from 3 for 4)') , {$eq: date}),
        sequelize.where(sequelize.literal('substring(paidNo from 7 for 2)') , {$eq: bankCode})
        ]
    },
    order: [[sequelize.literal('substring(paidNo, -3)'), 'DESC']],
    transaction: t
  });
  if (!c_order) return date + bankCode + appcfg.payOrReceive.P + accountType + '-' + appcfg.paymentType.I + '000';
  else return `${c_order.dataValues.paidNo.slice(2, 9)}${accountType}${c_order.dataValues.paidNo.slice(11)}`;
};


/**
 *
 * 出纳确认收到发票
 * @param req
 * @param res
 */
exports.receiveInvoice = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'idArr', null, true, null) &&
      common.getreqparameter(req, res, args, 'action', null, true, null)
    ){
      await models.order.update({invoiceStatus: args.action}, {where: {id: {$in: args.idArr}}})
    }
  };
  run().then( ()=> common.ressendsuccess(req, res))
    .catch(common.catchsendmessage(req, res))
};

/**
 * 根据成本中心、报销类型，确定当前使用的 vendor 及对应的银行账号
 *
 * @param req
 * @param res
 */
exports.getVendorOnOrder = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'reimuserId', null, true, null) &&
      common.getreqparameter(req, res, args, 'paytypeId', null, true, null)
    ){
      let c_detail = await models.reimuserdetail.findOne({
        where: {
          status: 1,
          reimuserId: args.reimuserId,
          paytypeId: args.paytypeId
        },
        order: [['validDate', 'DESC']],
        include: [{
          model: models.vendordetail,
          include: [{
            model: models.vendor
          }]
        }]
      });
      if (!c_detail || !c_detail.vendordetail) return null;
      return {
        vendorName: c_detail.vendordetail.vendor.name,
        bankNum: c_detail.vendordetail.bankNum,
        bankName: c_detail.vendordetail.bankName,
      }
    }
  };
  run().then( (data)=> common.ressendsuccess(req, res, {vendor: data}))
    .catch(common.catchsendmessage(req, res))
};

/**
 * 出纳获取到打印的 order
 *
 * @param req
 * @param res
 */
exports.getPrintedOrder = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'orderId', null, true, null)
    ){
      let c_order = await models.order.findOne({where: {id: args.orderId}});
      if (c_order.dataValues.approStatus === approStatus.abandoned) throw new Error(211);

      c_order.receiveOrderStatus = appcfg.y;
      await c_order.save();
    }
  };
  run().then( ()=> common.ressendsuccess(req, res))
    .catch(common.catchsendmessage(req, res))

};