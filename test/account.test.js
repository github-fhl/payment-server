const
  should = require('should')
  , clone = require('clone')
  , session = require('supertest-session')
  , getType = require('../component/protypemethon').getType
  , rejectArr = require('../component/appcfg').rejectArr
  , testCfg = require('./config.test')
  , testFn = require('./fn.test')
  , roles = testCfg.roles
  , args = testFn.args
  , login = testFn.login
  , handleRequest = testFn.handleRequest
  , stateMachine = require('./stateMachine.test')
  ;

describe.skip('创建账户，添加角色', function () {
  let handleObj;
  this.timeout(0);

/*********** 从 ldap 中创建账户 **************************/
  it('维护人员登录', login(roles.maintainer));
  it('维护人员获取 ldap 中账户信息', handleRequest('get', 'ldaps', null, 'success', (res) =>{
    res.body.status.should.be.equal('success');
    args.ldapInfo = res.body.users[0];
    args.ldapInfo1 = res.body.users[1];
  }));

  let accountInfo = {};
  handleObj = () => accountInfo.accountArr = [args.ldapInfo, args.ldapInfo1];
  it('维护人员从 ldap 中创建员工', handleRequest('post', 'accounts', accountInfo, handleObj, 'success'));

/*********** 给账户添加角色、删除角色 *******************************/
  let accountroleInfo = {};
  handleObj = () => {
    accountroleInfo.accountIdArr = [args.ldapInfo.cn, args.ldapInfo1.cn];
    accountroleInfo.roleId = 'chief';
  };
  it('给员工添加角色', handleRequest('post', 'accountroles', accountroleInfo, handleObj, 'success'));

  handleObj = () => args.url += `/${args.ldapInfo.cn}`;
  it('查看员工拥有 chief 角色', handleRequest('get', 'accounts', null, handleObj, 'success', (res) => {
    res.body.status.should.be.equal('success');
    let flag = false;
    res.body.account.roles.forEach((item) => {
      if (item.id == 'chief') {
        flag = true;
        args.accountroleId = item.accountrole.id;
      }
    });
    flag.should.be.equal(true);
  }));

  handleObj = () => args.accountroleidArr = [args.accountroleId];
  it('删除员工角色', handleRequest('delete', 'accountroles', args, handleObj, 'success'));

  handleObj = () => args.url += `/${args.ldapInfo.cn}`;
  it('查看员工删除 chief 角色', handleRequest('get', 'accounts', null, handleObj, 'success', (res) => {
    res.body.status.should.be.equal('success');
    let flag = false;
    res.body.account.roles.forEach((item) => {
      if (item.id == 'chief') {
        flag = true;
        args.accountroleId = item.accountrole.id;
      }
    });
    flag.should.be.equal(false);
  }));

/********** 删除账户 **********************************/
  handleObj = () => args.url += `?id=${args.ldapInfo.cn}`;

  it('删除账户', handleRequest('get', 'dropAccount', null, handleObj, 'success'))

  handleObj = () => args.url += `?id=${args.ldapInfo1.cn}`;

  it('删除账户', handleRequest('get', 'dropAccount', null, handleObj, 'success'))

});