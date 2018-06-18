const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('applylog:log')
  , de = require("debug")('applylog:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , createObjOrAddAttribute = fn.createObjOrAddAttribute
  , rbac=require('../component/accesscheck').rbac
  , {cfg} = require('config')
  , {logType} = cfg
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    let args = {};
    if (common.getreqparameter(req, res, args, 'id', true)){

      let logNum = await exports.getLogNums(args.id, {});
      return {rows: logNum}
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {applylogs: obj.rows}) )
    .catch(common.catchsendmessage(req, res))
};

/**
 * 规则：
 *    我的清单有两种，一个是待提交的，一个是进行中的（主管审批后，需要打印 / 出纳付款失败后，申请人员需要修改信息）
 *
 *    财务人员有一个特殊的情况，付款成功后，需要财务人员去分配科目
 *      1. 内部申请单，是 GL / InterCompany 去分配
 *      2. production 申请单，是 Accountant 去分配
 *
 * @param accountId
 * @param condition
 * @return {Promise.<{}>}
 */
exports.getLogNums = async (accountId, condition) => {

  let roleArr = await fn.getRoles(accountId);
  let $or = [
    {toHandleUsr: accountId},
    {toHandleRole: {$in: roleArr}},
  ];
  createObjOrAddAttribute(condition, 'where', '$or', $or);
  createObjOrAddAttribute(condition, 'where', 'applyStatus', appcfg.applyStatus.toHandle);
  condition.group = 'operation';
  condition.attributes = [[sequelize.fn('count', sequelize.col('id')), 'count'], 'operation'];
  let rows = await models.applylog.findAll(condition);
  let logArr = Object.keys(logType);
  let logNum = {};
  logArr.forEach((item)=>{
    if (!logNum[item]) logNum[item] = 0;
    rows.forEach((log)=>{
      if (logType[item].hasAttr(log.dataValues.operation)){
        logNum[item] += log.dataValues.count;
      }
    })
  });
  logNum.approvingOrder = await models.order.count({
    where: {approStatus: {$in: [appcfg.approStatus.payFailed]}, createdUsr: accountId},
  });
  logNum.approvingOrder += await models.order.count({
    where: {approStatus: {$in: [appcfg.approStatus.toApproByCashier]}, printStatus: appcfg.n, vendorType: appcfg.vendorType.company, createdUsr: accountId},
  });

  let financeSubjectNum = await models.order.count({
    where: {approStatus: appcfg.approStatus.paySucceed, subjectStatus: appcfg.n}
  });
  if (roleArr.includes(appcfg.roles.finance)) logNum.financeSubject = 0;
  if (roleArr.includes(appcfg.roles.GL) || roleArr.includes(appcfg.roles.InterCompany)) logNum.financeSubject = financeSubjectNum;

  return logNum;
};