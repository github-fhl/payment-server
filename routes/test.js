const
  common = require('./../component/common')
  , util = require('./../component/util')
  , fn = require('./../component/fn')
  , models  = require('../models').models
  , dl = require('debug')('order:log')
  , de = require("debug")('order:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , rbac = require('../component/accesscheck').rbac
  , rbacGrant = require('../component/accesscheck').rbacGrant
  , generatorId = require('../component/fn').generatorId
  , appcfg = require('../component/appcfg')
  , idType = appcfg.idType
  , removeAttrs = appcfg.removeAttrs
  , category = appcfg.category
  , operation = appcfg.operation
  , approType = appcfg.approType
  , moment = require('moment')
  , decorateCondition = fn.decorateCondition
  , reimuser = require('./reimuser')
  , checkRole = fn.checkRole
  , transitions = require('./machine/index').transitions
  ;

exports.test = (req, res) => {
  let run = async () => {
    return await models.account.findOne({
      where: {id: req.user.id}
    })
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {account: obj}) )
    .catch(common.catchsendmessage(req, res))
};


exports.testGetRoles = async(req, res) => {
  let grant = rbacGrant();
  console.log(grant.grants);
  console.log(grant.roles);
  let roles = [];
  let c_account = await models.account.findOne({
    where: {id: 'A_chief'},
    attributes: ['id'],
    include: [{
      model: models.role,
      attributes: ['id'],
      where: {status: 1},
      required: false
    }],
  });
  let initRoles = c_account.roles.map((item) => {
    return item.dataValues.id;
  });
  initRoles.forEach((item) => {
    getUnitRole(item, roles)
  });
  function getUnitRole(roleId, roles) {
    roles.push(roleId);
    grant.grants[roleId].forEach((unit) => {
      if (grant.roles.indexOf(unit) !== -1) {
        getUnitRole(unit, roles)
      }
    })
  }
  roles = roles.unique();
  res.send({result: roles});
};



// es6 尚不支持对 对象的 ... 扩展运算符
exports.testExtensionOperator = async(req, res) =>{
  let a = [1,2,3,4];
  let b = [1,2,3,...a];

  let x = {
    a: 'qwe',
    b: 'ert'
  };
  let z = {
    b: 'hjk'
  };
  //
  // let y = {
  //   ...x,
  //   ...z
  // };

  res.json(y);
};


exports.testReimuserCurrent = async(req, res) =>{
//   let data = await sequelize.query(`SELECT *
// FROM (SELECT reimuserId, paytypeId, max(validDate) maxDate
// FROM reimuserdetail
// GROUP BY reimuserId, paytypeId
// ) b JOIN reimuserdetail a ON a.reimuserId = b.reimuserId AND a.paytypeId = b.paytypeId AND a.validDate = b.maxDate JOIN reimuser c ON c.id = a.reimuserId;`);
  let data = await sequelize.query(`SELECT c.id 'reimuserId', c.name 'name',  a.id 'reimuserdetailId', a.money 'money', a.validDate 'validDate', a.paytypeId 'paytypeId', a.vendordetailId 'vendordetailId', v.name 'vendorName', vd.bankName 'bankName', vd.bankNum 'bankNum'
FROM (SELECT reimuserId, paytypeId, max(validDate) maxDate
FROM reimuserdetail
GROUP BY reimuserId, paytypeId
) b JOIN reimuser c ON c.id = b.reimuserId JOIN reimuserdetail a ON a.reimuserId = b.reimuserId AND a.paytypeId = b.paytypeId AND a.validDate = b.maxDate JOIN vendordetail vd ON vd.id = a.vendordetailId JOIN vendor v ON v.id = vd.vendorId order by name;`, {type: sequelize.QueryTypes.SELECT});
//   let data = await models.reimuser.findAll({
//     include: [{
//       // separate: true,
//       required: false,
//       model: models.reimuserdetail,
//       where: {
//         validDate: {$lte: '2017-10'},
//       },
//     }]
//   });
  // let data = await models.reimuserdetail.findAll({
  //   where: {
  //     validDate: {$lte: '2017-10'},
  //     status: 1
  //   },
  //   attributes: {exclude: removeAttrs},
  //   order: "validDate DESC",
  //   group: ['reimuserId', 'paytypeId']
  // });
  res.send({data: data});
};


exports.test1 = async(req,res)=>{
  let c_order = await models.order.findOne({
    where: {id: '201703001'},

    include: [{
      model: models.orderdetail,
      where: {status: 1},
      required: false,

      include: [{
        required: true,
        model: models.vendor,

        include: [{
          required: true,
          model: models.vendordetail,
          where: {status: 1, bankNum: {$eq: sequelize.col('orderdetails.bankNum')}}
        }]
      }]
    }]
  });
  res.send({result: c_order})
};

exports.testForEach = async(req,res)=>{
  let a = [1,2,3,4,5,6];
  await a.forEach(async(item)=>{
    console.log('item: ',item);
    await models.order.findOne({where:{id: '20170300'+item}})
  });

  for (let i = 0, len = a.length; i < len; i++){
    let item = a[i];
    console.log('item: ','x:' + item);
    await models.order.findOne({where:{id: '20170300'+item}})
  }
  let results = await models.order.findAll();
  res.send({data: results});
};


exports.testDecorateCondition = (req,res) =>{
  let condition = {
    where: {id: '1'},
    attributes: {exclude: removeAttrs.concat(['status'])},
    include: [{
      model: models.orderdetail,
      required: false,
      where: {status: 1},
      attributes: {exclude: removeAttrs}
    }]
  };
  decorateCondition(models.order, condition);
  console.log('condition: ',condition.include[0]);
  console.log('condition.include: ',condition.include[1]);
};



exports.testDecorateResults = async (req, res) =>{
  let result = {
    "id": "201703001",
    "description": "测试订单",
    "applyDate": "2017-03-20T08:00:00+08:00",
    "amount": 2000,
    "subjectStatus": "n",
    "printStatus": "n",
    "invoiceStatus": "n",
    "remark": "备注",
    "createdAt": "2017-03-20T16:09:36+08:00",
    "companyId": "24787240-06da-11e7-b23d-513f39f5849c",
    "currency": "CNY",
    "approStatus": "toSubmit",
    "orderdetails": [
      {
        "id": "8edaf160-0d44-11e7-ad08-8b82f8dedfef",
        "money": 1000,
        "bankNum": "4444444444444444444444",
        "bankName": "朝鲜银行",
        "contacter": "胖哥",
        "telphone": "021-14141414",
        "remark": "备注",
        "status": 1,
        "createdAt": "2017-03-20T16:09:36+08:00",
        "paytypeId": "paper",
        "orderId": "201703001",
        "vendorId": "8ed0b830-0d44-11e7-ad08-8b82f8dedfef",
        "payeeType": "vendor",
        "vendor": {
          "name": "248a4c90-06da-11e7-b23d-513f39f5849c"
        },
        "paytype": {
          "category": "office"
        }
      },
      {
        "id": "8edaf161-0d44-11e7-ad08-8b82f8dedfef",
        "money": 1000,
        "bankNum": "5555555555555555555555555555",
        "bankName": "开发银行",
        "contacter": "胖哥",
        "telphone": "021-14141414",
        "remark": "备注",
        "status": 1,
        "createdAt": "2017-03-20T16:09:36+08:00",
        "paytypeId": "paper",
        "orderId": "201703001",
        "vendorId": "8ed0b830-0d44-11e7-ad08-8b82f8dedfef",
        "payeeType": "vendor",
        "vendor": {
          "name": "248a4c90-06da-11e7-b23d-513f39f5849c"
        },
        "paytype": {
          "category": "office"
        }
      }
    ],
    "applylogs": [
      {
        "id": "8ee02180-0d44-11e7-ad08-8b82f8dedfef",
        "applyStatus": "toHandle",
        "time": 1,
        "status": 1,
        "createdAt": "2017-03-20T16:09:36+08:00",
        "orderId": "201703001",
        "operation": "create",
        "operator": "superMan",
        "toHandleUsr": "superMan",
        "approType": "byAccount"
      }
    ],
    "company": {
      "name": "Blue Hive"
    }
  };
  fn.decorateResults(result);
  res.send({data: result});
};