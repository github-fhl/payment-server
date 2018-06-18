const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('reimuserdetail:log')
  , de = require("debug")('reimuserdetail:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , checkArgType = fn.checkArgType
  , decorateCondition = fn.decorateCondition
  , rbac=require('../component/accesscheck').rbac
  , reimuser = require('./reimuser')
  , moment = require('moment')
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    let condition = common.findlistfromreq(req, res, models.reimuserdetail);
    condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
    if (condition.include){
      condition.include.forEach((item)=>{
        fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
        fn.createObjOrAddAttribute(item, 'where', 'status', 1);
      })
    }
    decorateCondition(models.reimuserdetail, condition);
    let rows = await models.reimuserdetail.findAll(condition);
    return {rows: rows, count: rows.length}
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuserdetails: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};

//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.reimuserdetail.findOne({where:{id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuserdetail: obj}) )
  .catch(common.catchsendmessage(req, res))
};

/**
 * 删除时将该reimuser的所有该类别的付款类型数据全部删除
 * @param req
 * @param res
 */
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'reimuserId', null, true, null) &&
      common.getreqparameter(req, res, args, 'paytypeId', null, true, null)
    ){
      return await models.reimuserdetail.update({status: 0}, {where: {reimuserId: args.reimuserId, paytypeId: args.paytypeId}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuserdetail: obj}) )
  .catch(common.catchsendmessage(req, res))
};

/**
 * 规则：
 *    创建时，需要检查当前生效的 detail 时间，新建的 detail 的时间不能早于当前生效的时间
 *    创建、更新后，对应的有效期不能存在相同
 *
 * 对传来的数据进行校验：
 *    创建、更新时，对应的有效期不能相同
 *    最多只能有两条数据，而且每条数据必须包含 money、validDate、vendordetailId
 *    对于没有传ID，进行新增操作
 *      创建时，需要检查当前生效的 detail 时间，新建的 detail 的时间不能早于当前时间
 *    对于传了ID的，进行编辑/删除操作
 *      对于传了 delete = true 的进行删除操作
 *        用 destroy 强制删除
 *      没有 delete 的进行编辑操作
 *        当前生效的可以修改 金额、vendor账号
 *        对于未来生效的可以修改 金额、vendor账号、生效日期
 *
 * @param req
 * @param res
 */
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{

        args.details.forEach((item) => {
          ['money', 'validDate', 'vendordetailId'].forEach((key) => {
            if (!item[key]) throw new Error(`6,${key}`);
          });
          item.reimuserId = args.reimuserId;
          item.paytypeId = args.paytypeId;
          item.paytypedetailId = args.paytypedetailId || null;
        });
        if (args.details.length > 2) throw new Error(505);

        // let c_reimuser = await reimuser.getCurrentReimuserDetail(args.details[0].reimuserId, args.details[0].paytypeId, null, t);
        let $currentDetail = await models.reimuserdetail.findOne({
          transaction: t,
          where: {
            paytypeId: args.paytypeId,
            paytypedetailId: args.paytypedetailId || null,
            validDate: {$lte: moment().format('YYYY-MM')},
            status: 1
          },
          order: "validDate DESC",
        })

        for (let i = 0, len = args.details.length; i < len; i++){
          let item = args.details[i];

          /*** 不存在 id 时，用新建；存在时，用编辑 ***/
          if (!item.id) await newReimuserDetail(item, req.user.id, t);
          else {
            if (item.delete) await deleteReimuserDetail(item, t);
            else await updateReimuserDetail(item, $currentDetail, req.user.id, t);
          }
        }
        return reimuser.getCurrentReimuserDetail(args.details[0].reimuserId, args.details[0].paytypeId, null, t)
      });
    };
    if(
      common.getreqparameter(req, res, args, 'reimuserId', null, true, null) &&
      common.getreqparameter(req, res, args, 'paytypeId', null, true, null) &&
      common.getreqparameter(req, res, args, 'paytypedetailId', null, false, null) &&
      common.getreqparameter(req, res, args, 'details', null, true, null)
    ){

      args.details.forEach((item)=>{
        if (!checkArgType(item.validDate, 'YYYY-MM')) throw new Error(5);
      });
      return await create()
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuserdetail: obj}) )
  .catch(common.catchsendmessage(req, res))
};

/***
 * 新建对应的 reimuserdetail
 * 规则：
 *    不能创建小于当前月份的预设费用
 *
 * @param detail
 * @param userId
 * @param t
 * @return {Promise.<void>}
 */
async function newReimuserDetail(detail, userId, t) {
  if (detail.validDate < moment().format('YYYY-MM')) throw new Error(501);
  let c_checkDetail = await models.reimuserdetail.findOne({
    where: {
      reimuserId: detail.reimuserId,
      validDate: detail.validDate,
      paytypeId: detail.paytypeId,
      paytypedetailId: detail.paytypedetailId,
    },
    transaction: t
  });
  if (c_checkDetail) throw new Error(502);
  detail.createdUsr = userId;
  await models.reimuserdetail.create(detail, {transaction: t});
}

/***
 * 更新对应的 reimuserdetail
 *
 * @param detail
 * @param currentDetail
 * @param userId
 * @param t
 * @return {Promise.<void>}
 */
async function updateReimuserDetail(detail, currentDetail, userId, t) {
  let c_checkDetail = await models.reimuserdetail.findOne({
    where: {
      reimuserId: detail.reimuserId,
      validDate: detail.validDate,
      paytypeId: detail.paytypeId,
      paytypedetailId: detail.paytypedetailId,
      id: {$ne: detail.id}},
    transaction: t
  });
  if (c_checkDetail) throw new Error(502);
  if (currentDetail && detail.id === currentDetail.dataValues.id){
    if (detail.validDate !== currentDetail.dataValues.validDate) throw new Error(503);
    for (let key in detail){
      if (['money', 'vendordetailId'].indexOf(key) !== -1){
        currentDetail[key] = detail[key];
      }
    }
    currentDetail.updatedUsr = userId;
    await currentDetail.save({transaction: t});
  }
  else {
    if (detail.validDate <= moment().format('YYYY-MM')) throw new Error(501);
    let c_oldDetail = await models.reimuserdetail.findOne({
      where: {id: detail.id}, transaction: t
    });
    if (c_oldDetail.dataValues.validDate <= moment().format('YYYY-MM')) throw new Error(501);
    for (let key in detail){
      if (['money', 'vendordetailId', 'validDate'].indexOf(key) !== -1){
        c_oldDetail[key] = detail[key];
      }
    }
    c_oldDetail.updatedUsr = userId;
    await c_oldDetail.save({transaction: t});
  }
}

async function deleteReimuserDetail(detail, t) {
  await models.reimuserdetail.destroy({
    where: {id: detail.id},
    transaction: t
  })
}