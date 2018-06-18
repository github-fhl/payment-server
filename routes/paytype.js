const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('paytype:log')
  , de = require("debug")('paytype:error')
  , sequelize  = require('../models').sequelize
  , fn = require('../component/fn')
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    let $paytypes = await models.paytype.findAll({
      attributes: ['id', 'category', 'description', 'rankNum', 'subjectId', 'createdAt'],
      order: [['rankNum', 'ASC']],
      where: {status: 1},
      include: [{
        model: models.paytypedetail,
        separate: true,
        required: false,
        where: {status: 1},
        order: [['rankNum', 'ASC']],
        attributes: ['id', 'paytypeId', 'description', 'rankNum', 'subjectId', 'createdAt']
      }]
    })

    return {rows: $paytypes, count: $paytypes.length}
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {paytypes: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.paytype.findOne({
        where:{id: args.id},
        include: [{
          model: models.paytypedetail,
          where: {status: 1},
          required: false
        }]
      })
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {paytype: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//更新
exports.update = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null) && 
      common.getreqparameter(req, res, args, 'description', null, false, null) &&
      common.getreqparameter(req, res, args, 'category', null, false, null) &&
      common.getreqparameter(req, res, args, 'details', null, false, null)
    ){
      return sequelize.transaction((async(t) => {
        let obj = await models.paytype.findOne({
          where:{id: args.id},
          transaction: t,
          include: [{
            model: models.paytypedetail,
            status: 1
          }]
        });

        if (!obj) throw new Error(`3,${args.id}`);

        obj.description = args.description;
        obj.updatedUsr = req.user.id;
        let c_paytype = await obj.save({transaction: t});

        let keyArr = obj.paytypedetails.map((item) => item.dataValues.id);
        args.details.forEach((item) => {
          if (item.operate === appcfg.operate.new) item.paytypeId = args.id;
        });
        await fn.updateDetailInfoSafety(req, 'id', keyArr, args.details, models.paytypedetail, t);
        return await fn.getData(models.paytype, {id: args.id}, t, models.paytypedetail);
      }));
    }
  };
  run().then( (data) => common.ressendsuccess(req, res, {paytype: data}) )
  .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.paytype.update({status: 0}, {where: {id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {paytype: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//增加
/**
 * 规则：
 *    只有 operatingCost 类别的费用，才能创建 detail
 *
 * @param req
 * @param res
 */
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{
        args.createdUsr = req.user.id;
        let c_paytype = await models.paytype.create(args, {transaction: t});

        args.details.forEach((item) => item.paytypeId = args.id);

        await models.paytypedetail.bulkCreate(args.details, {transaction: t});

        return await fn.getData(models.paytype, {id: args.id}, t, models.paytypedetail);
      });
    };
    if(
      common.getreqparameter(req, res, args, 'id', null, false, null) &&
      common.getreqparameter(req, res, args, 'description', null, false, null) &&
      common.getreqparameter(req, res, args, 'category', null, true, null) &&
      common.getreqparameter(req, res, args, 'details', null, true, null)
    ){
      if(common.isExist(args.id)) {
        await checkCreate(args.id, args.details)
        return await create()
      }else{
        return await create()
      }
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {paytype: obj}) )
    .catch(common.catchsendmessage(req, res))
};

/**
 * paytype 和 paytypedetail 的 id 不能重复
 */

async function checkCreate (id, details, t) {
  let ids = [
    id,
    ...details.map(detail => detail.id)
  ]

  let count = await models.paytype.count({
    where: {
      id: {$in: ids}
    }
  })
  if (count !== 0) throw new Error(`id 存在重复`)

  count = await models.paytypedetail.count({
    where: {
      id: {$in: ids}
    }
  })
  if (count !== 0) throw new Error(`id 存在重复`)
}

