const
   should = require('should')
  , clone = require('clone')
  , moment = require('moment')
  , session = require('supertest-session')
  , getType = require('../component/protypemethon').getType
  , rejectArr = require('../component/appcfg').rejectArr
  , testCfg = require('./config.test')
  , testFn = require('./fn.test')
  , order = clone(testCfg.order)
  , orderSubjects = clone(testCfg.orderSubjects)
  , roles = testCfg.roles
  , port = testCfg.port
  , agent = testCfg.agent
  , login = testFn.login
  , appcfg = require('../component/appcfg')
  , operation = appcfg.operation
  , approStatus = appcfg.approStatus
  ;

const cashierType = {
  approve: 'approve',
  pay: 'pay'
};

let orderArr = [];
exports.orderArr = orderArr;

/**
 * 返回一个根据角色、状态查看 order 的cb
 * @param role
 * @param applyStatus
 * @param cashierType
 * @param num
 * @return {Function}
 */
function checkOrder(role, applyStatus, cashierType, num) {
  let str = `orders?status=1&role=${role}&applyStatus=${applyStatus}`;
  if (getType(cashierType) == 'number'){
    num = cashierType;
    cashierType = null;
  }
  if (cashierType) str += `&cashierType=${cashierType}`;
  return function (done) {
    agent
      .get(str)
      .expect((res) => {
        res.body.orders.length.should.be.equal(num);
        if (res.body.orders.length !== num) console.log('num: ', res.body.orders.length);
        res.body.orders.forEach((item) => {
          item.applylogs.forEach((unit) => {
            if ([operation.create ,operation.submit, operation.abandon, operation.cashierPaySucceed].indexOf(unit.operation) == -1){
              unit.remark.should.be.equal('remark');
            }
          });
          item.ordersubjects.forEach((unit) => {
            if (item.approStatus == approStatus.paySucceed) {
              unit.subjectId.should.be.equalOneOf('111a73a0-06da-11e7-b23d-513f39f5849c','222a73a0-06da-11e7-b23d-513f39f5849c');
              unit.type.should.be.equalOneOf('credit','debit');
            }
          });
        });
      })
      .end(done);
  }
}


/**
 * 可以根据填入的拒绝角色，选定到哪一步结束操作
 * @param rejectRole
 * @param type
 * @return {Function}
 */
function generatorIt(rejectRole, type) {
  let downFlag = false;  //当被拒绝后就结束了，进入删除阶段
  return function () {
    it('普通员工登录', login(roles.applicant));

    /**************************** 创建 2 份订单 ******************************************************/
    it('普通员工创建第一份 order ', function (done) {
      delete order.isSubmit;
      delete order.accountId;
      agent
        .post('orders')
        .send(order)
        .expect(function (res) {
          res.body.status.should.be.equal('success');
          orderArr[0] = res.body.order.id;
        })
        .end(done);
    });
    it('普通员工创建第二份 order ，并提交 order', function (done) {
      order.isSubmit = true;
      order.accountId = 'A_manager';
      agent
        .post('orders')
        .send(order)
        .expect(function (res) {
          res.body.status.should.be.equal('success');
          orderArr[1] = res.body.order.id;
        })
        .end(done);
    });

    it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 1));
    it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 1));
    it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));


    /**************************** 第一次提交订单 ******************************************************/
    it('普通员工修改order，并提交', function (done) {
      setTimeout(function () {
        agent
          .put(`orders/${orderArr[0]}`)
          .send(order)
          .expect(function (res) {
            res.body.status.should.be.equal('success');
          })
          .end(done);
      },700);
    });

    it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 0));
    it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 2));
    it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));

    /*************************** 员工撤回订单 ********************************************************/
    it('普通员工撤回 order', approveFlow('backout', [0]));
    it('普通员工撤回 order', approveFlow('backout', [1]));

    it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 2));
    it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 0));
    it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));

    it('主管登录', login(roles.manager));
    it('主管查看待处理 order ', checkOrder('manager', 'toHandle', 0));
    it('主管查看已处理 order ', checkOrder('manager', 'handled', 0));


    /**************************** 第二次提交订单 ******************************************************/
    it('普通员工登录', login(roles.applicant));
    it('普通员工第二次提交order', function (done) {
      agent
        .put(`submit/orders`)
        .send({"accountId": "A_manager", idArr:[orderArr[0]]})
        .expect(function (res) {
          res.body.status.should.be.equal('success');
        })
        .end(done);
    });

    it('普通员工第二次提交order', function (done) {
      agent
        .put(`submit/orders`)
        .send({"accountId": "A_manager", idArr:[orderArr[1]]})
        .expect(function (res) {
          res.body.status.should.be.equal('success');
        })
        .end(done);
    });

    it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 0));
    it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 2));
    it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));

    /**************************** 主管否决订单 ******************************************************/
    if (rejectRole == roles.manager){
      it('主管登录', login(roles.manager));

      it('主管查看待处理 order ', checkOrder('manager', 'toHandle', 2));
      it('主管查看已处理 order ', checkOrder('manager', 'handled', 0));

      it('主管否决order', approveFlow('managerRefuse', [0]));
      it('主管否决order', approveFlow('managerRefuse', [1]));

      it('主管查看待处理 order ', checkOrder('manager', 'toHandle', 0));
      it('主管查看已处理 order ', checkOrder('manager', 'handled', 2));

      downFlag = true;
      destroyOrder(downFlag);
      return ;
    }
    /**************************** 主管批准订单 ******************************************************/

    it('主管登录', login(roles.manager));

    it('主管查看待处理 order ', checkOrder('manager', 'toHandle', 2));
    it('主管查看已处理 order ', checkOrder('manager', 'handled', 0));

    it('主管批准order', approveFlow('managerAppro', [0]));
    it('主管批准order', approveFlow('managerAppro', [1]));

    it('主管查看待处理 order ', checkOrder('manager', 'toHandle', 0));
    it('主管查看已处理 order ', checkOrder('manager', 'handled', 2));


    /**************************** 出纳否决订单 ******************************************************/
    if (rejectRole == roles.cashier && type == cashierType.approve){
      it('出纳登录', login(roles.cashier));

      it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', type, 2));
      it('出纳查看已处理 order ', checkOrder('cashier', 'handled', type,0));

      it('出纳否决order', approveFlow('cashierRefuse', [0]));
      it('出纳否决order', approveFlow('cashierRefuse', [1]));

      it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', type,0));
      it('出纳查看已处理 order ', checkOrder('cashier', 'handled', type,2));

      downFlag = true;
      destroyOrder(downFlag);
      return ;
    }

    /**************************** 出纳批准订单 ******************************************************/

    it('出纳登录', login(roles.cashier));

    it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', cashierType.approve, 2));
    it('出纳查看已处理 order ', checkOrder('cashier', 'handled', cashierType.approve, 0));

    it('出纳批准order', approveFlow('cashierAppro', [0]));
    it('出纳批准order', approveFlow('cashierAppro', [1]));

    it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', cashierType.approve, 0));
    it('出纳查看已处理 order ', checkOrder('cashier', 'handled', cashierType.approve, 2));


    /**************************** 财务否决订单 ******************************************************/
    if (rejectRole == roles.finance){
      it('财务登录', login(roles.finance));

      it('财务查看待处理 order ', checkOrder('finance', 'toHandle', 2));
      it('财务查看已处理 order ', checkOrder('finance', 'handled', 0));

      it('财务否决order', approveFlow('financeRefuse', [0]));
      it('财务否决order', approveFlow('financeRefuse', [1]));

      it('财务查看待处理 order ', checkOrder('finance', 'toHandle', 0));
      it('财务查看已处理 order ', checkOrder('finance', 'handled', 2));

      downFlag = true;
      destroyOrder(downFlag);
      return ;
    }

    /**************************** 财务批准订单 ******************************************************/

    it('财务登录', login(roles.finance));

    it('财务查看待处理 order ', checkOrder('finance', 'toHandle', 2));
    it('财务查看已处理 order ', checkOrder('finance', 'handled', 0));

    it('财务批准order', approveFlow('financeAppro', [0,1]));

    it('财务查看待处理 order ', checkOrder('finance', 'toHandle', 0));
    it('财务查看已处理 order ', checkOrder('finance', 'handled', 2));

    /**************************** 财务主管否决订单 ******************************************************/
    if (rejectRole == roles.chief){
      it('财务主管登录', login(roles.chief));

      it('财务主管查看待处理 order ', checkOrder('chief', 'toHandle', 2));
      it('财务主管查看已处理 order ', checkOrder('chief', 'handled', 0));

      it('财务主管否决order', approveFlow('chiefRefuse', [0]));
      it('财务主管否决order', approveFlow('chiefRefuse', [1]));

      it('财务主管查看待处理 order ', checkOrder('chief', 'toHandle', 0));
      it('财务主管查看已处理 order ', checkOrder('chief', 'handled', 2));

      downFlag = true;
      destroyOrder(downFlag);
      return ;
    }

    /**************************** 财务主管批准订单 ******************************************************/

    it('财务主管登录', login(roles.chief));

    it('财务主管查看待处理 order ', checkOrder('chief', 'toHandle', 2));
    it('财务主管查看已处理 order ', checkOrder('chief', 'handled', 0));

    it('财务主管批准order', approveFlow('chiefAppro', [0,1]));

    it('财务主管查看待处理 order ', checkOrder('chief', 'toHandle', 0));
    it('财务主管查看已处理 order ', checkOrder('chief', 'handled', 2));

    /**************************** 出纳导出订单 ******************************************************/

    it('出纳登录', login(roles.cashier));

    it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', cashierType.pay, 2));
    it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  cashierType.pay,2));

    it('出纳导出 order', approveFlow('cashierExport', [0,1]));

    it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', cashierType.pay, 2));
    it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  cashierType.pay,2));


    /**************************** 出纳付款失败，申请人修改成功 ******************************************************/
    if (rejectRole == roles.cashier && type == cashierType.pay){
      it('出纳登录', login(roles.cashier));

      it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', type, 2));
      it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  type,2));

      it('出纳付款失败', approveFlow('cashierPayFailed', [0,1]));

      it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', type, 0));
      it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  type, 2));

      it('普通员工登录', login(roles.applicant));

      it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 0));
      it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 2));
      it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));

      it('普通员工修改并提交 order ', approveFlow('applicantUpdate', [0, 1]));

      it('出纳登录', login(roles.cashier));

      it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', type, 2));
      it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  type,2));

      downFlag = true;
      let roleType = 'cashier';
      destroyOrder(downFlag, roleType);
      return ;
    }

    /**************************** 出纳付款成功 ******************************************************/

    it('出纳登录', login(roles.cashier));

    it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', cashierType.pay, 2));
    it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  cashierType.pay,2));

        /***   第一次付款，失败，返回 code = 312 ***/
    it('出纳付款失败，code=312', approveFlow('cashierPaySucceed', [0,1], function (res) {
      if (res.body.status == 'failed') console.log('res: ',res.body);
      res.body.status.should.be.equal('failed');
      res.body.code.should.be.equal('312');
    }));
        /***   第二次付款，成功 ***/
    it('出纳付款成功', approveFlow('cashierPaySucceed', [0,1]));

    it('出纳查看待处理 order ', checkOrder('cashier', 'toHandle', cashierType.pay, 0));
    it('出纳查看已处理 order ', checkOrder('cashier', 'handled',  cashierType.pay,2));

    /******************************* 财务进行科目拆分 *************************************************/

    it('财务登录', login(roles.finance));

    it('财务进行科目拆分', function (done) {
      orderSubjects.orderId = orderArr[0];
      agent
        .post('ordersubjects')
        .send(orderSubjects)
        .expect(function (res) {
          res.body.status.should.be.equal('success');
        })
        .end(done);
    });

    /**************************** 删除订单 ******************************************************/
    destroyOrder(downFlag)
  }
}

function destroyOrder(downFlag, type) {
  it('普通员工登录', login(roles.applicant));

  if (downFlag){
    if (type !== 'cashier'){
      it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 2));
      it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 0));
      it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));
    }else{
      it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 0));
      it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 2));
      it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 0));
    }
  }
  else{
    it('普通员工查看待处理 order ', checkOrder('applicant', 'toHandle', 0));
    it('普通员工查看正在处理的 order ', checkOrder('applicant', 'handling', 0));
    it('普通员工查看已处理的order', checkOrder('applicant', 'handled', 2));
  }

  it('删除order', function (done) {
    agent
      .get(`dropOrder?description=${order.description}`)
      .expect(function (res) {
        res.body.status.should.be.equal('success');
      })
      .end(done);
  });
}

exports.destroyOrder = destroyOrder;

describe('审批流程测试，截止到主管拒绝', generatorIt(roles.manager));
describe('审批流程测试，截止到出纳拒绝', generatorIt(roles.cashier, cashierType.approve));
describe('审批流程测试，截止到财务拒绝', generatorIt(roles.finance));
describe('审批流程测试，截止到财务主管拒绝', generatorIt(roles.chief));
describe('审批流程测试，截止到出纳付款失败', generatorIt(roles.cashier, cashierType.pay));
describe.only('审批流程测试，到出纳付款成功，截止到财务进行科目拆分', generatorIt());


/**
 * 返回一个审批操作的cb
 * @param type
 * @param arr
 * @param cb
 * @return {Function}
 */
function approveFlow(type, arr = [0], cb) {
  return function (done) {
    let idArr = [];
    arr.forEach((key) => {
      idArr.push(orderArr[key]);
    });
    let data = {
      idArr: idArr,
      rejectRemark: 'remark',
    };
    if (type == 'cashierPaySucceed') {
      data.subjectId = '222a73a0-06da-11e7-b23d-513f39f5849c';
      data.subjectDate = moment().format('YYYYMM').slice(2);
      data.paidNo = {
        [orderArr[0]]: `BH${data.subjectDate}HCP11-001`,
        [orderArr[1]]: `BH${data.subjectDate}HCP11-002`
      }
    }
    if (cb) data.paidNo[orderArr[1]] = `BH${data.subjectDate}HCP11-003`;
    cb = cb || function (res) {
        if (res.body.status == 'failed') console.log('res: ',res.body);
        res.body.status.should.be.equal('success');
      };

    agent
      .put(`${type}/orders`)
      .send(data)
      .expect(cb)
      .end(done);
  }
}

exports.approveFlow = approveFlow;

/**
 * 暂停函数
 * @param ms
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}