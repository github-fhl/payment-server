const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('accountrole:log')
  , de = require("debug")('accountrole:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , rbac=require('../component/accesscheck').rbac
  ;

/**
 * 删除用户的角色
 *
 * @param req
 * @param res
 */
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'accountroleidArr', null, true, null)){
      return await models.accountrole.destroy({where: {id: {$in: args.accountroleidArr}}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {accountrole: obj}) )
  .catch(common.catchsendmessage(req, res))
};

/**
 * 为用户批量添加角色
 *
 * @param req
 * @param res
 */
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{

        await models.accountrole.destroy({where: {accountId: args.accountId}});
        let accountRoleArr = args.roleIdArr.map(roleId => {
          return {
            accountId: args.accountId,
            roleId,
            createdUsr: req.user.id
          }
        });

        await models.accountrole.bulkCreate(accountRoleArr, {transaction: t});
      });
    };
    if(
      common.getreqparameter(req, res, args, 'accountId', null, false, null) &&
      common.getreqparameter(req, res, args, 'roleIdArr', null, false, null)
    ){
      await create()
    }
  };
  run().then( ()=> common.ressendsuccess(req, res) )
  .catch(common.catchsendmessage(req, res))
};