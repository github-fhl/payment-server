const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('subject:log')
  , de = require("debug")('subject:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , rbac=require('../component/accesscheck').rbac
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    let condition = common.findlistfromreq(req, res, models.subject);
    condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
    if (condition.include){
      condition.include.forEach((item)=>{
        fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
        fn.createObjOrAddAttribute(item, 'where', 'status', 1);
      })
    }
    condition.order = [
      ['bankFlag', 'ASC'],
      ['code', 'ASC']
    ]

    decorateCondition(models.subject, condition);
    let rows = await models.subject.findAll(condition);
    return {rows: rows, count: rows.length}
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {subjects: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.subject.findOne({where:{id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {subject: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//更新
/**
 * 验证编辑后的 code 不能重复
 *
 * @param req
 * @param res
 */
exports.update = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null) && 
      common.getreqparameter(req, res, args, 'name', null, false, null) &&
      common.getreqparameter(req, res, args, 'code', null, false, null) &&
      common.getreqparameter(req, res, args, 'accountType', null, false, null) &&
      common.getreqparameter(req, res, args, 'bankNum', null, false, null) &&
      common.getreqparameter(req, res, args, 'bankCode', null, false, null) &&
      common.getreqparameter(req, res, args, 'bankFlag', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null) 
    ){
      if (args.code){
        let checkNum = await models.subject.count({
          where: {
            code: args.code,
            id: {$ne: args.id}
          }
        });
        if (checkNum !== 0) throw new Error(`10, --- code --- ${args.code}`);
      }
      let obj = await models.subject.findOne({where:{id: args.id}});
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
  run().then( (obj) => common.ressendsuccess(req, res, {subject: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.subject.update({status: 0}, {where: {id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {subject: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//增加
/**
 * 规则：
 *    如果科目是银行类别，那么必须传递 accountType/bankCode/bankNum
 *    验证 code 的重复性
 *
 * @param req
 * @param res
 */
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{
        let checkNum = await  models.subject.count({
          where: {code: args.code},
          transaction: t
        });
        if (checkNum != 0) throw new Error(`10, --- code --- ${args.code}`);
        args.createdUsr = req.user.id;
        if (args.bankFlag == appcfg.y) {
          ['accountType', 'bankCode', 'bankNum'].forEach((item) => {
            if (!args[item]) throw new Error(`6, ${item}`)
          })
        }
        return await models.subject.create(args, {transaction: t});
      });
    };
    if(
      common.getreqparameter(req, res, args, 'name', null, true, null) &&
      common.getreqparameter(req, res, args, 'bankFlag', null, false, null) &&
      common.getreqparameter(req, res, args, 'code', null, true, null) &&
      common.getreqparameter(req, res, args, 'accountType', null, false, null) &&
      common.getreqparameter(req, res, args, 'bankNum', null, false, null) &&
      common.getreqparameter(req, res, args, 'bankCode', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null)
    ){
      return await create()
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {subject: obj}) )
  .catch(common.catchsendmessage(req, res))
};