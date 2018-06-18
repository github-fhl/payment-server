const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('signature:log')
  , de = require("debug")('signature:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , getData = fn.getData
  , rbac=require('../component/accesscheck').rbac
  ;


//增加
/***
 * 传递一个图片的数组，需要判断该用户原始数据和现有数据，从而判断操作是 新增、删除
 *
 * @param req
 * @param res
 */
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{
        let c_signatures = await models.signature.findAll({
          where: {accountId: args.accountId, status: 1},
          transaction: t
        });
        args.pathArr.forEach((item) => {
          item.accountId = args.accountId;
        });
        await fn.updateDetailInfo(req, c_signatures, args.pathArr, models.signature, t);
        args.createdUsr = req.user.id;
        return await getData(models.account, {id: args.accountId}, t, models.signature)
      });
    };
    if(
      common.getreqparameter(req, res, args, 'pathArr', null, true, null) &&
      common.getreqparameter(req, res, args, 'accountId', null, true, null) 
    ){
      return await create()
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {signature: obj}) )
  .catch(common.catchsendmessage(req, res))
};



function randomSignature(signatures) {
  if (signatures.length === 0) return null;
  let index = parseInt(Math.random() * signatures.length);
  return signatures[index].path
}

exports.randomSignature = randomSignature;
