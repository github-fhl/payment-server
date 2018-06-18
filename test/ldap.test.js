const
  should = require('should')
  , clone = require('clone')
  , session = require('supertest-session')
  , getType = require('../component/protypemethon').getType
  , rejectArr = require('../component/appcfg').rejectArr
  , testCfg = require('./config.test')
  , testFn = require('./fn.test')
  , order = clone(testCfg.order)
  , roles = testCfg.roles
  , port = testCfg.port
  , agent = testCfg.agent
  , login = testFn.login
  , handleRequest = testFn.handleRequest
  , stateMachine = require('./stateMachine.test')
  , destroyOrder = stateMachine.destroyOrder
  , approveFlow = stateMachine.approveFlow
  , orderArr = stateMachine.orderArr
  ;

describe.skip('测试 ldap 中的接口', function () {

  this.timeout(0);
/******** ldap 员工登录 *************************************************/
  it('ldap 员工登录', login({id: 'ap\\shscan', password: 'Password1'}));

/******** 普通员工调用 ldap 接口，无权限 *********************************/
  it('普通员工登录', login(roles.applicant));
  it('调用获取 ldap user 信息接口', handleRequest('get', 'ldaps', null, 'failed', null, 401));

/******** 维护人员调用 ldap 接口 **************************************/
  it('维护人员登录', login(roles.maintainer));
  it('调用获取 ldap user 信息接口', handleRequest('get', 'ldaps', null, 'success'));

/******** 维护人员获取所有部门信息 ***************************************/
  it('维护人员回去所有部门信息', handleRequest('get', 'ldaps/departments', null, 'success'))

});