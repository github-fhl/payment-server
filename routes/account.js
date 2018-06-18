const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('account:log')
  , de = require("debug")('account:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , rbac=require('../component/accesscheck').rbac
  , fn = require('../component/fn')
  , generatorId = fn.generatorId
  , getData = fn.getData
  , checkRole = fn.checkRole
  , decorateCondition = fn.decorateCondition
  , applylog = require('./applylog')
  , roles = appcfg.roles
  ;

const {getLogNum} = require('../src/service/applyLog')

exports.login = function(req, res) {
  let account;
  account = req.user;
  account.password = '';
  return common.ressendsuccess(req, res, account);
};

exports.logout = function(req, res) {
  let account, logout;
  logout = function() {
    req.logout();
    return req.session.destroy(function(err) {
      if (err) {
        return common.ressenderror(req, res);
      } else {
        return common.ressendsuccess(req, res);
      }
    });
  };
  if (req.user) {
    account = req.user;
    return logout();
  } else {
    return common.ressendsuccess(req, res);
  }
};

exports.loginerror = function(req, res) {
  let errors = (req.flash('error'));
  return common.ressenderror(req, res, errors[0]);
};


exports.getUserInfo = (req, res) => {
  let run = async ()=>{
    if (!req.user) throw new Error(104);
    // let condition = common.findlistfromreq(req, res, models.applylog);
    req.user.dataValues.logNum = await getLogNum({id: req.user.id});
  };
  run().then( ()=> {
    common.ressendsuccess(req, res, req.user)
  } )
    .catch(common.catchsendmessage(req, res));
};


//批量获取
exports.getlist = (req, res)=>{
  let args = {};
  let run = async ()=>{
    req.body.include = 'role,signature';
    let condition = common.findlistfromreq(req, res, models.account);
    if (
      common.getreqparameter(req, res, args, 'roleId', false)
    ){
      condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
      if (condition.include){
        condition.include.forEach((item)=>{
          fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
          fn.createObjOrAddAttribute(item, 'where', 'status', 1);
        })
      }
      decorateCondition(models.account, condition);
      let rows = await models.account.findAll(condition);
      // 对结果根据角色进行筛选
      if (args.roleId){
        rows = rows.filter((item) => {
          for (let i = 0, len = item.roles.length; i < len; i++){
            let role = item.roles[i];
            if (role.dataValues.id === args.roleId){
              return item;
            }
          }
        })
      }
      return {rows: rows, count: rows.length}
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {accounts: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await getData(models.account, {id: args.id}, null, models.signature, models.role)
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {account: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'idArr', null, true, null)){
      return await models.account.update({status: 0}, {where: {id: {$in: args.idArr}}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {account: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//增加
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t) => {
        let AccountRoleArr = [];
        for (let i = 0, len = args.accountArr.length; i < len; i++){
          let item = args.accountArr[i];
          item.name = item.cn;
          delete item.cn;
          item.createdUsr = req.user.id;
          AccountRoleArr.push({
            accountId: item.id,
            roleId: appcfg.roles.general
          });

          // 当根据 ldap 中抓取到的 number 有重复时，将其号码置为空
          let checkTelephoneNumber = await models.account.count({where: {status: {$not: 0}, telephoneNumber: item.telephoneNumber}, transaction: t});
          if (checkTelephoneNumber !== 0) item.checkTelephoneNumber = null;
        }

        try{
          await models.account.bulkCreate(args.accountArr, {transaction: t});
        }catch (err){
          console.log('err: ', err);

          // 判断是否存在重复，如果有重复则查看是否是旧的被删除的 account，然后报错
          if (err.sql && err.errors && err.errors.length !== 0){
            if (err.errors[0].message === 'PRIMARY must be unique'){
              let c_duplicateAcccount = await models.account.findOne({where: {id: err.errors[0].value}, transaction: t});
              if (c_duplicateAcccount.dataValues.status === 0) throw new Error(`111,${err.errors[0].value}`);
              throw new Error(`106,${err.errors[0].value}`);
            }else throw err;
          }else throw err;
        }
        await models.accountrole.bulkCreate(AccountRoleArr, {transaction: t});
      });
    };
    if(
      common.getreqparameter(req, res, args, 'accountArr', null, false, null)
    ){
      console.log('accountArr: ', args.accountArr);
      return await create()
    }
  };
  run().then( ()=> common.ressendsuccess(req, res) )
  .catch(common.catchsendmessage(req, res))
};


/**
 *
 * 给账户添加主管、总监，并修改相应信息
 *
 * 规则：
 *    检查审批用户是否拥有主管权限
 *    检查分机号是否存在重复
 *
 * @param req
 * @param res
 */

exports.update = (req, res) => {
  let run = async() => {
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'id', null, false, null) &&
      common.getreqparameter(req, res, args, 'managerUsr', null, false, null) &&
      common.getreqparameter(req, res, args, 'directorUsr', null, false, null) &&
      common.getreqparameter(req, res, args, 'department', null, false, null) &&
      common.getreqparameter(req, res, args, 'title', null, false, null) &&
      common.getreqparameter(req, res, args, 'mail', null, false, null) &&
      common.getreqparameter(req, res, args, 'telephoneNumber', null, false, null)
    ){
      if (!(await checkRole(args.managerUsr, roles.manager))) throw new Error(`109,${args.managerUsr}`);
      if (!(await checkRole(args.directorUsr, roles.manager))) throw new Error(`109,${args.directorUsr}`);

      let checkTelephoneNumber = await models.account.count({where: {status: {$not: 0}, telephoneNumber: args.telephoneNumber, id: {$not: args.id}}});
      if (checkTelephoneNumber !== 0) throw new Error(`108,${args.id} --- ${args.telephoneNumber}`);

      let c_account = await models.account.findOne({where: {id: args.id}});
      if (!c_account) throw new Error(`3,${args.id}`);

      for (let key in args) {
        let value = args[key];
        if (key !== 'id' && (value !== null)) {
          c_account[key] = value;
        }
        c_account.updatedUsr = req.user.id
      }
      return await c_account.save();
    }
  };
  run().then( (c_account)=> common.ressendsuccess(req, res, {account: c_account}) )
    .catch(common.catchsendmessage(req, res))
};
