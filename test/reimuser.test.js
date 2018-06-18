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
  ;

let reimuserData = [
  {name: 'testRobet'}
];
let data = {
  paytypeId: 'cola',
  details:
    [
      {money: 1000, validDate: '2017-07', vendordetailId: '69b6a690-0eca-11e7-8881-5f624753c8ec'},
      {money: 3000, validDate: '2017-12', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
    ]
};
let reimuserId;

describe('创建 reimuser', function () {
  let roleArr = Object.keys(roles);

  /************************** 普通员工无法创建 reimuser ***********************************/
  it('普通员工登录', login(roles.applicant));
  it('普通员工创建 reimuser', function (done) {
    agent
      .post('reimusers')
      .send(reimuserData[0])
      .expect(401)
      .end(done);
  });

  /*************************** hr 创建reimuser ****************************************/
  it('HR 登录', login(roles.hr));
  it('HR 创建 reimuser', function (done) {
    agent
      .post('reimusers')
      .send(reimuserData[0])
      .expect(function (res) {
        res.body.status.should.be.equal('success');
        reimuserId = res.body.reimuser.id;
        data.reimuserId = reimuserId;
      })
      .end(done);
  });

  /*************************** 财务创建 reimsuerdetail **************************************/
  it('财务 登录', login(roles.finance));
  it('财务 创建 reimuserdetail', function (done) {
    agent
      .post('reimuserdetails')
      .send(data)
      .expect(function (res) {
        if (res.body.status == 'failed'){
          console.log(res.body);
        }
        res.body.status.should.be.equal('success');
      })
      .end(done);
  });
  it('财务 创建重复的 reimuserdetail', function (done) {
    agent
      .post('reimuserdetails')
      .send(data)
      .expect(function (res) {
        res.body.status.should.be.equal('failed');
        res.body.code.should.be.equal('502')
      })
      .end(done);
  });

  it('财务 获取对应的 reimuserdetail', function (done) {
    agent
      .get(`reimusers/${reimuserId}?paytypeId=cola`)
      .expect(function (res) {
        res.body.status.should.be.equal('success');
        let fieldArr = ['future', 'current', 'history'];
        fieldArr.forEach((field) => {
          res.body.reimuser[field].forEach((item) => {
            data.details.forEach((unit) => {
              if (item.validDate == unit.validDate){
                unit.id = item.id;
              }
            })
          })
        });
      })
      .end(done)
  });

  it('财务 编辑对应的 reimuserdetail', function (done) {
    data.details[0].money = 5000;
    data.details[1].validDate = '2017-09';
    agent
      .post('reimuserdetails')
      .send(data)
      .expect(function (res) {
        if (res.body.status == 'failed'){
          console.log(res.body);
        }
        res.body.status.should.be.equal('success');
      })
      .end(done);
  });

  /****************************


  /***************************** 删除 reimuser ***************************************************/

  it('删除 reimuser', function (done) {
    agent
      .get(`dropReimuser?id=${reimuserId}`)
      .expect(function (res) {
        res.body.status.should.be.equal('success');
      })
      .end(done);
  });

});
