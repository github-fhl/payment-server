
const
  session = require('supertest-session')
  , appcfg = require('../component/appcfg')
  ;

exports.port = 9501;
exports.agent = session(`http://localhost:${exports.port}/`);



exports.order = {
  "description" : "测试订单",
  "vendorType": "user",
  "remark" : "备注",
  "companyId" : "24787240-06da-11e7-b23d-513f39f5849c",
  "currency" : "CNY",
  "details" : [{
    "money" : "1",
    "payDate" : "2017-09",
    "bankNum" : "110110",
    "bankName" : "不厉害的银行",
    "paytypeId" : "COLA",
    "reimuserId" : "24941090-06da-11e7-b23d-513f39f5849c",
    "vendorName" : "你好呀",
    "contacter" : "胖哥",
    "telphone" : "021-14141414",
    "remark" : "备注"
  }]
};

exports.roles = {
  applicant : {
    "id": "A_applicant",
    "password": "123"
  },manager : {
    "id": "A_manager",
    "password": "123"
  },cashier : {
    "id": "A_cashier",
    "password": "123"
  },finance : {
    "id": "A_finance",
    "password": "123"
  },chief : {
    "id": "A_chief",
    "password": "123"
  },hr : {
    "id": "A_hr",
    "password": "123"
  },maintainer : {
    "id": "A_maintainer",
    "password": "123"
  },InterCompany: {
    "id": "A_InterCompany",
    "password": "123"
  },GL: {
    "id": "A_GL",
    "password": "123"
  }
};

exports.orderSubjects = {
  details: [{
    type: appcfg.subjectType.debit,
    money: 1000,
    subjectId: "111a73a0-06da-11e7-b23d-513f39f5849c"  //科目1
  },{
    type: appcfg.subjectType.credit,
    money: 1000,
    subjectId: "222a73a0-06da-11e7-b23d-513f39f5849c"   //中国银行
  }]
};