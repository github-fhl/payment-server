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
  , decorateCondition = fn.decorateCondition
  , applylog = require('./applylog')
  , ldap = require('ldapjs')
  , assert = require('assert')
  ;


/**
 *  根据筛选条件获取所有的用户信息
 *  获取所有的部门名称
 *  验证登录
 *
 * @param {String} filter  筛选条件
 * @param {String} username  账户名
 * @param {String} password  密码
 * @param {String} type  返回的数据类别  user/department/login
 * @param cb
 */

let getLdapInfoCb = (filter, username, password, type, cb) => {

  const client = ldap.createClient({
    url: 'ldap://10.139.152.32:389'
  });

  client.bind(username, password, (err)=>{
    if (err) {
      console.log('err:', err)
      return cb(null, false);
    }
    if (type == 'login') {
      return client.unbind(function(err) {
        if (err) return cb(null, false);
        return cb(null, true);
      });
    }

    let opts = {
      attributes: ['sAMAccountName', 'userAccountControl', 'cn', 'mail', 'pwdLastSet', 'title', 'department', 'telephoneNumber'],
      filter: filter,
      scope: 'sub',
      paged: true
    };

    let base = "ou=ap-sha-1515-jwt,ou=ap-sha-1515,ou=ap-sha,dc=AP,dc=CORP,dc=JWT,dc=COM";

    let departmentArr = [];
    let userArr = [];
    client.search(base, opts, function(err, res) {
      if (err) return cb(null, false);

      res.on('searchEntry', function(entry) {

        if (entry.object.department && departmentArr.indexOf(entry.object.department) == -1) departmentArr.push(entry.object.department);
        if (entry.object.pwdLastSet === '0') throw new Error('密码过期');
        if (entry.object.userAccountControl === '514') throw new Error('禁用');

        console.log('entry: ', entry.object)

        userArr.push({
          id: entry.object.sAMAccountName,
          cn: entry.object.cn,
          title: entry.object.title,
          department: entry.object.department,
          mail: entry.object.mail,
          telephoneNumber: entry.object.telephoneNumber,
        });
      });
      res.on('error', function(err) {
        if (err) return cb(null, false);
      });
      res.on('end', function(result) {

        client.unbind(function(err) {
          if (err) return cb(null, false);
          userArr.sort(function(a, b) {
            return a.cn.localeCompare(b.cn);
          });
          departmentArr.sort();

          if (type == 'user') return cb(null, userArr);
          else if (type == 'department') return cb(null, departmentArr);
        });
      });
    });
  });

  client.on('error',  function(err) {
    cb(err)
  });
};
let getLdapInfo = fn.promisify(getLdapInfoCb);
exports.getLdapInfo = getLdapInfo;

let defaultUsername = `ap\\shscan`;
let defaultPassword = 'Password1';

/**
 * 根据筛选条件获取所有的人员信息
 *
 * @param req
 * @param res
 */
exports.getlist = (req, res) =>{
  let run = async()=>{
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'cn', false) &&
      common.getreqparameter(req, res, args, 'department', false)
    ){
      let prefixStr = `(&`;
      let end = `(!(pwdLastSet=0))(!(userAccountControl=514)))`;
      if (args.cn){
        args.cn = args.cn.split('');
        args.cn = '*' + args.cn.join('*') + '*';
        prefixStr += `(cn=${args.cn})`;
      }else{
        prefixStr += `(cn=*)`;
      }
      if (args.department) prefixStr += `(department=${args.department})`;
      let filter = prefixStr + end;
      return await getLdapInfo(filter, defaultUsername, defaultPassword, 'user');
    }
  };
  run().then((users) => common.ressendsuccess(req, res, {users: users}))
    .catch(common.catchsendmessage(req, res));
};


/**
 * 获取 ldap 中所有的部门
 *
 * @param req
 * @param res
 */
exports.getDepartments = (req, res) => {
  let run = async()=>{
    let filter = `(&(cn=*)(department=*)(!(pwdLastSet=0))(!(userAccountControl=514)))`;
    return await getLdapInfo(filter, defaultUsername, defaultPassword, 'department');
  };
  run().then((departments) => common.ressendsuccess(req, res, {departments: departments}))
    .catch(common.catchsendmessage(req, res));
};
