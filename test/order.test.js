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
  , stateMachine = require('./stateMachine.test')
  , destroyOrder = stateMachine.destroyOrder
  , approveFlow = stateMachine.approveFlow
  , orderArr = stateMachine.orderArr
  , handleRequest = testFn.handleRequest
  , args = testFn.args
  ;

order.details[0].payDate = "201503";

function getOrder(errNum) {
  let check;
  if (errNum){
    check = (res)=>{
      res.body.status.should.be.equal('failed');
      res.body.code.should.be.equal(errNum);
    }
  }else {
    check = (res)=>{
      res.body.status.should.be.equal('success');
    }
  }
  return function (done) {
    agent
      .get(`orders/${orderArr[0]}`)
      .expect(function (res) {
        check(res);
      })
      .end(done);
  }
}

let obj = {}, handleObj;

describe('获取 order 信息，需要判断是否拥有权限', function () {
  let roleArr = Object.keys(roles);

  it('普通员工登录', login(roles.applicant));

  /************************* 根据选择的成本中心、报销类型，获取当前 vendor ***********************/
  it('根据选择的成本中心、报销类型，获取当前 vendor', handleRequest('get', `currentvendor?reimuserId=${order.details[0].reimuserId}&paytypeId=car`, null, 'success'));

  /************************* 第一次创建 order ，报格式错误 code = 5 ****************************/
  it('普通员工第一次创建 order ，报格式错误 code = 5 ', function (done) {
    agent
      .post('orders')
      .send(order)
      .expect(function (res) {
        res.body.status.should.be.equal('failed');
        res.body.code.should.be.equal('5');
      })
      .end(done);
  });
  /************************* 第二次创建 order ，报没有对应月的预算 code = 204 ****************************/
  it('普通员工第二次创建 order ，报没有对应月的预算 code = 204 ', function (done) {
    order.details[0].payDate = "2015-03";
    agent
      .post('orders')
      .send(order)
      .expect(function (res) {
        res.body.status.should.be.equal('failed');
        res.body.code.should.be.equal('204');
      })
      .end(done);
  });
  /************************* 第三次创建 order ，成功 ****************************/
  it('第三次创建 order ，成功 ', function (done) {
    order.details[0].payDate = "2017-03";
    agent
      .post('orders')
      .send(order)
      .expect(function (res) {
        res.body.status.should.be.equal('success');
        orderArr[0] = res.body.order.id;
        args.orderdetailIdArr = [res.body.order.orderdetails[0].id, res.body.order.orderdetails[1].id]
      })
      .end(done);
  });

  /************************** 创建后，只有普通员工能看到order ***********************************/
  for (let i = 0, len = roleArr.length; i < len; i ++){
    let item = roleArr[i];
    it(`${item} 登录`, login(roles[item]));
    let errNum = '205';
    let successArr = ['applicant'];
    if (successArr.indexOf(item) !== -1) errNum = null;
    it(`${item} 查看`, getOrder(errNum));
  }


  /************************** 提交后，普通员工、对应的manager 能看到order ***********************************/
  it('普通员工登录', login(roles.applicant));
  handleObj = () => {
    obj.idArr = [orderArr[0]];
  };
  it('普通员工提交order', handleRequest('put', 'submit/orders', obj, handleObj, 'success'));

  for (let i = 0, len = roleArr.length; i < len; i ++){
    let item = roleArr[i];
    it(`${item} 登录`, login(roles[item]));
    let errNum = '205';
    let successArr = ['applicant', 'manager'];
    if (successArr.indexOf(item) !== -1) errNum = null;
    it(`${item} 查看`, getOrder(errNum));
  }
  it('另外的主管登录', login({"id": "A_manager_B", "password": "123"}));
  it(`另外的主管查看`, getOrder('205'));

  /************************** 主管批准后，普通员工、manager、cashier 能看到order ***********************************/
  it('主管登录', login(roles.manager));
  it('主管批准order', approveFlow('managerAppro'));

  for (let i = 0, len = roleArr.length; i < len; i ++){
    let item = roleArr[i];
    it(`${item} 登录`, login(roles[item]));
    let errNum = '205';
    let successArr = ['applicant', 'manager', 'cashier'];
    if (successArr.indexOf(item) !== -1) errNum = null;
    it(`${item} 查看`, getOrder(errNum));
  }

  /************************** 出纳批准后，出纳修改 order，出纳确认发票收到， 普通员工、manager、cashier、finance、chief 能看到order ***********************************/
  it('出纳登录', login(roles.cashier));

  handleObj = () => {
    args.url += orderArr[0];
    obj.details = order.details;
    obj.details[0].orderdetailId = args.orderdetailIdArr[0];
    obj.details[1].orderdetailId = args.orderdetailIdArr[1];
  };
  it('出纳修改 order', handleRequest('put', 'cashierOrders/', obj, handleObj, 'success'));

  handleObj = () => {
    obj.idArr = [orderArr[0]];
  };
  it('出纳确认发票收到', handleRequest('put', 'orderInvoice', obj, handleObj, 'success'));

  it('出纳批准order', approveFlow('cashierAppro'));

  for (let i = 0, len = roleArr.length; i < len; i ++){
    let item = roleArr[i];
    it(`${item} 登录`, login(roles[item]));
    let errNum = '205';
    let successArr = ['applicant', 'manager', 'cashier', 'finance', 'chief'];
    if (successArr.indexOf(item) !== -1) errNum = null;
    it(`${item} 查看`, getOrder(errNum));
  }

  /***************************** 删除order ***************************************************/

  it('删除order', function (done) {
    agent
      .get(`dropOrder?description=${order.description}`)
      .expect(function (res) {
        res.body.status.should.be.equal('success');
      })
      .end(done);
  });

});
