const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('argmain:log')
  , de = require("debug")('argmain:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , rbac=require('../component/accesscheck').rbac
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    let condition = common.findlistfromreq(req, res, models.argmain);
    condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
    if (condition.include){
      condition.include.forEach((item)=>{
        fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
        fn.createObjOrAddAttribute(item, 'where', 'status', 1);
      })
    }
    decorateCondition(models.argmain, condition);
    let rows = await models.argmain.findAll(condition);
    return {rows: rows, count: rows.length}
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {argmains: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.argmain.findOne({where:{id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {argmain: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//更新
exports.update = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null) && 
      common.getreqparameter(req, res, args, 'name', null, false, null) &&
      common.getreqparameter(req, res, args, 'editFlag', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null) 
    ){
      let obj = await models.argmain.findOne({where:{id: args.id}});
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
  run().then( (obj) => common.ressendsuccess(req, res, {argmain: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.argmain.update({status: 0}, {where: {id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {argmain: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//增加
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{
        args.createdUsr = req.user.id;
        return await models.argmain.create(args, {transaction: t});
      });
    };
    if(
      common.getreqparameter(req, res, args, 'id', null, false, null) &&
      common.getreqparameter(req, res, args, 'name', null, false, null) &&
      common.getreqparameter(req, res, args, 'editFlag', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null) 
    ){
      if(common.isExist(args.id)) {
        await common.checkRepeatId(models.argmain, 'id', args.id);
        return await create()
      }else{
        return await create()
      }
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {argmain: obj}) )
  .catch(common.catchsendmessage(req, res))
};