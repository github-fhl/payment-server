const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('reimuser:log')
  , de = require("debug")('reimuser:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , getData = fn.getData
  , checkRole = fn.checkRole
  , checkArgType = fn.checkArgType
  , rbac=require('../component/accesscheck').rbac
  , moment = require('moment')
  , createObjOrAddAttribute = fn.createObjOrAddAttribute
  , approStatus = appcfg.approStatus
  , removeAttrs = appcfg.removeAttrs
  , roles = appcfg.roles
  ;

//批量获取
/**
 * 获取付款对象的paytype当前生效的数据
 *
 * @param req
 * @param res
 */

exports.getlist = (req, res)=>{
  let run = async ()=>{
    let c_reimuser = await models.reimuser.findAll({
      where: {status: 1},
      include: [{
        model: models.reimuserdetail,
        separate: true,
        include: [{
          model: models.vendordetail,
          include: [{
            model: models.vendor
          }]
        }],
        order: 'validDate ASC'
      }],
      attributes: ['id', 'name', 'companyId']
    });

    let nowDate = moment().format('YYYY-MM');
    c_reimuser.forEach((reimuser) => {
      let details = reimuser.dataValues.reimuserdetails;
      delete reimuser.dataValues.reimuserdetails;
      reimuser.dataValues.details = [];

      let paytypes = {};

      for (let i = 0, len = details.length; i < len; i++){
        let item = details[i];
        item.dataValues.bankName = item.vendordetail.dataValues.bankName;
        item.dataValues.bankNum = item.vendordetail.dataValues.bankNum;
        item.dataValues.vendorName = item.vendordetail.vendor.dataValues.name;
        delete item.dataValues.vendordetail;

        if (!paytypes[item.paytypeId]) {
          paytypes[item.paytypeId] = item;
        }
        else {
          if (paytypes[item.paytypeId].validDate > nowDate) {
            paytypes[item.paytypeId] = item
          }
        }
      }

      // console.log('paytypes: ', paytypes);

      reimuser.dataValues.details = Object.values(paytypes);
    });

    return {rows: c_reimuser, count: c_reimuser.length};
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimusers: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res));
};

/**
 * 当查询报销月份字段不存在时，就返回该员工对应报销类型的所有记录
 * 根据reimuser的报销月份和报销类型，查出其对应的预算、已花费、剩余金额
 * 当对应员工的 detail.length == 0 时，代表该员工在这个月没有该项报销额度
 * 根据当前生效的 detail ，区分历史、当前、未来
 *
 * @param req
 * @param res
 */
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'id', null, true, null) &&
      common.getreqparameter(req, res, args, 'validDate', null, false, null) &&
      common.getreqparameter(req, res, args, 'paytypeId', null, true, null)
    ){
      let c_currentReimuser = await exports.getCurrentReimuserDetail(args.id, args.paytypeId, args.validDate);
      if (args.validDate){
        if (c_currentReimuser.dataValues.name === appcfg.publicCost || c_currentReimuser.dataValues.name === appcfg.others) {
          c_currentReimuser.dataValues.rest = 0;
          return c_currentReimuser;
        }

        if (c_currentReimuser.reimuserdetails.length === 0) throw new Error(`204, ${c_currentReimuser.dataValues.name} --- ${args.validDate}`);
        return c_currentReimuser;
      }
      let condition = {
        where:{id: args.id},
        attributes: {exclude: removeAttrs},
        include:[{
          model: models.reimuserdetail,
          required: false,
          separate: true,
          where: {
            paytypeId: args.paytypeId,
            status: 1
          },
          attributes: {exclude: removeAttrs},
          order: "validDate DESC",
          limit: 30,
          include:[{
            model: models.vendordetail,
            attributes: ['bankNum', 'bankName', 'vendorId'],
            include: [{
              model: models.vendor,
              attributes: ['name'],
            }]
          }]
        }]
      };
      let c_reimuser = await models.reimuser.findOne(condition);
      if (!c_reimuser) throw new Error(103);
      if (c_reimuser.dataValues.status == 0) throw new Error(504);

      c_reimuser.dataValues.future = [];
      c_reimuser.dataValues.current = [];
      c_reimuser.dataValues.history = [];
      c_reimuser.reimuserdetails.forEach((item) => {
        if (c_currentReimuser.reimuserdetails.length == 0 || item.dataValues.validDate > c_currentReimuser.reimuserdetails[0].dataValues.validDate) c_reimuser.dataValues.future.push(item.dataValues);
        else if (item.dataValues.validDate == c_currentReimuser.reimuserdetails[0].dataValues.validDate) c_reimuser.dataValues.current.push(item.dataValues);
        else if (item.dataValues.validDate < c_currentReimuser.reimuserdetails[0].dataValues.validDate) c_reimuser.dataValues.history.push(item.dataValues);
      });
      delete c_reimuser.dataValues.reimuserdetails;

      return c_reimuser;

    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuser: obj}) )
  .catch(common.catchsendmessage(req, res))
};

/**
 * 根据给定的 reimuser、paytype ，获得当前生效的 reimuserdetail
 * 计算剩余预算，根据所有未废弃的 order ，计算出剩余预算
 * 获取所有 orderdetail 时，有时需要排除当前的 order，然后计算 rest
 *
 * 对于运营成本类别的 paytype，publicCost 拥有无限制
 *
 * @param reimuserId
 * @param paytypeId
 * @param validDate
 * @param t
 * @param excludeOrderId
 * @return {Promise.<*>}
 */
exports.getCurrentReimuserDetail = async(reimuserId, paytypeId, validDate, t, excludeOrderId) => {

  if (validDate) {
    if (!checkArgType(validDate, 'YYYY-MM')) throw new Error(5);
  }
  validDate = validDate || moment().format('YYYY-MM');

  let condition = {
    where:{id: reimuserId},
    attributes: {exclude: removeAttrs},
    include:[{
      model: models.reimuserdetail,
      required: true,
      separate: true,
      where: {
        paytypeId: paytypeId,
        validDate: {$lte: validDate},
        status: 1
      },
      attributes: {exclude: removeAttrs},
      order: "validDate DESC",
      limit: 1,
      include:[{
        model: models.vendordetail,
        attributes: ['bankNum', 'bankName', 'vendorId'],
      }]
    }],
    transaction: t
  };
  decorateCondition(models.reimuser, condition);

  let c_reimuser = await models.reimuser.findOne(condition);
  if (!c_reimuser) throw new Error(103);
  if (c_reimuser.dataValues.status === 0) throw new Error(504);
  if (c_reimuser.reimuserdetails.length === 0) return c_reimuser;

  let whereStr = {
    reimuserId: reimuserId,
    status: 1,
    payDate: validDate,
    paytypeId: paytypeId
  };
  if (excludeOrderId) whereStr.orderId = {$ne: excludeOrderId};
  let c_order = await models.order.findAll({
    where: {approStatus: {$ne: 'abandoned'}},
    attributes: ['id','approStatus'],
    include:[{
      required: true,
      model: models.orderdetail,
      where: whereStr,
      attributes: ['id', 'money', 'payDate', 'spendUsr', 'status']
    }],
    transaction: t
  });
  let cost = 0;
  c_order.forEach((order)=>{
    order.orderdetails.forEach((detail)=>{
      cost += detail.dataValues.money;
    });
  });
  let budget = c_reimuser.reimuserdetails[0].dataValues.money;
  c_reimuser.dataValues.rest = ( budget - cost).simpleFixed(2) || 0;
  c_reimuser.dataValues.cost = cost || 0;
  c_reimuser.dataValues.budget = budget || 0;
  decorateReimuser([c_reimuser]);
  return c_reimuser;
};

//更新
exports.update = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null) && 
      common.getreqparameter(req, res, args, 'name', null, false, null) &&
      common.getreqparameter(req, res, args, 'companyId', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null)
    ){
      let obj = await models.reimuser.findOne({where:{id: args.id}});
      if (!obj) throw new Error(`3,${args.id}`);
      if (obj.dataValues.name == appcfg.publicCost) throw new Error(`508,${appcfg.publicCost}`);
      if (args.name == appcfg.publicCost) throw new Error(`509,${appcfg.publicCost}`);
      for (let key in args) {
        let value = args[key];
        if ((key !== 'id') && (value != null)) {
          obj[key] = value;
        }
        obj.updatedUsr = req.user.id
      }
      return await obj.save();
    }
  };
  run().then( (obj) => common.ressendsuccess(req, res, {reimuser: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      let c_reimuser = await models.reimuser.findOne({where: {id: args.id}});
      if (!c_reimuser) throw new Error(`3,${args.id}`);
      if (c_reimuser.dataValues.name == appcfg.publicCost) throw new Error(`508,${appcfg.publicCost}`);

      return await models.reimuser.update({status: 0}, {where: {id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuser: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//增加
/**
 * 只有 hr 能够创建 reimuser
 * @param req
 * @param res
 */
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{
        args.createdUsr = req.user.id;
        if (args.name == appcfg.publicCost) throw new Error(`509,${appcfg.publicCost}`);
        return await models.reimuser.create(args, {transaction: t});
      });
    };
    if(
      common.getreqparameter(req, res, args, 'name', null, true, null) &&
      common.getreqparameter(req, res, args, 'companyId', null, true, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null)
    ){
      if(common.isExist(args.name)) {
        await common.checkRepeatId(models.reimuser, 'name', args.name);
        return await create()
      }else{
        return await create()
      }
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {reimuser: obj}))
  .catch(common.catchsendmessage(req, res))
};


function decorateReimuser(arr) {
  arr.forEach((item) => {
    item.reimuserdetails.forEach((detail) => {
      if (detail.vendordetail){
        detail.dataValues.bankNum = detail.vendordetail.dataValues.bankNum;
        detail.dataValues.bankName = detail.vendordetail.dataValues.bankName;
        detail.dataValues.vendorName = detail.vendordetail.vendor.dataValues.name;
        delete detail.dataValues.vendordetail;
      }
    })
  });
}





/**
 * 根据给定的预设费用detail数组，获取给定月份的生效detail
 *
 *
 * @param {Array} arr
 * @param {String} time:"2017-03"
 * @return {Array}
 */

// function decorateReimuser(arr,time = moment().format('YYYY-MM')) {
//
//   //获取所有不重复的paytypeId
//   let paytypeArr = (arr.map((item) => {
//     return item.dataValues.paytypeId
//   })).unique();
//
//   //获取每个paytype中的当前生效的detail
//   let temp = [];
//   paytypeArr.forEach((paytype, i) => {
//     temp[i] = arr.filter((item)=>{
//       if (item.dataValues.paytypeId == paytype && item.dataValues.validDate <= time  ){
//         return true
//       }
//     })
//   });
//   temp = temp.remove([[]]);
//   let results = [];
//   temp.forEach((item)=>{
//     item.sort(function (a, b) {
//       if (a.dataValues.validDate <= b.dataValues.validDate) return 1;
//       if (a.dataValues.validDate > b.dataValues.validDate) return -1
//     });
//     results.push(item[0]);
//   });
//   return results
// }
