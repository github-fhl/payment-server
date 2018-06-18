const
  common = require('./../component/common')
  , util = require('./../component/util')
  , fs = require('fs')
  , http = require('http')
  , models  = require('../models').models
  , dl = require('debug')('init:log')
  , de = require("debug")('init:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , rbac=require('../component/accesscheck').rbac
	, y=require('../component/appcfg').y
	, n=require('../component/appcfg').n
	, signaturePath=require('../component/appcfg').signaturePath
  , clone = require('clone')
  , accesscheck = require('../component/accesscheck')
  , routes = require("./index")
  , express = require("express")
  , router = express.Router()
  , passport = require("passport")
  // , fetch = require("node-fetch")
  , approStatus = require("../component/appcfg").approStatus
  , appcfg = require('../component/appcfg')
  , xlsx = require('node-xlsx')
  , path = require('path')
  ;

// require('es6-promise').polyfill();
// require('isomorphic-fetch');

/**
 * 删除所有用户、角色，然后创建一个管理员账号
 *
 * @param req
 * @param res
 */

exports.initAccount = (req, res) => {
  let run = async ()=>{
    let account = [
      {id: 'superMan', name: '超人', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef', nickname: '1', managerUsr: 'superMan', directorUsr: 'superMan', department: '财务部', telephoneNumber: 110},
      {id: 'shscan', name: 'shscan', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef', nickname: '2', managerUsr: 'shscan', directorUsr: 'shscan', department: '财务部', telephoneNumber: 110}
      ];
    let signature = [
      {id: '98c680b0-12a1-11e7-922d-e717b0d3d397', path: `upload/20170327/1.png`, accountId: 'superMan'},
      {id: '98c6a7c0-12a1-11e7-922d-e717b0d3d397', path: `upload/20170327/2.png`, accountId: 'shscan'}
      ];
    let role = {id: 'admin', name: '管理员'};
    let accountrole = [
      {accountId: 'superMan', roleId: 'admin'},
      {accountId: 'shscan', roleId: 'admin'},
      ];

    await sequelize.transaction( async (t) => {
      await models.accountrole.destroy({where:{status: 1}, transaction:t});
      await models.signature.destroy({where:{status: 1}, transaction:t});
      await models.account.destroy({where:{status: 1}, transaction:t});
      await models.role.destroy({where:{status: 1}, transaction:t});
      await models.account.bulkCreate(account, {transaction:t});
      await models.signature.bulkCreate(signature, {transaction:t});
      await models.role.create(role, {transaction:t});
      await models.accountrole.bulkCreate(accountrole, {transaction:t});
    });
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

/**
 * 删除现有的permission、grant，然后创建对应的角色的permission
 * @param req
 * @param res
 */

exports.initPermission = (req, res) => {
  let args = {};
  if (common.getreqparameter(req, res, args, 'roleId', true)
    && common.getreqparameter(req, res, args, 'filePath', true)
  ){
    let run = async () => {
      let permissionSQL = fs.readFileSync(path.join(__dirname, '../permission.sql'), 'utf8');
      let permissionArr = permissionSQL.split(';');

      await sequelize.transaction( async (t)=>{
        await models.grant.destroy({where: {status: 1}, transaction:t});
        await models.permission.destroy({where: {status: 1}, transaction:t});
        for (let i = 0, len = permissionArr.length; i < len; i ++){
          let item = permissionArr[i];
          if (item.indexOf('INSERT') == -1) continue;
          await sequelize.query(item, {transaction: t});
          let permissionId = item.split("VALUES ('")[1].split("'")[0];
          let grant = {roleId: args.roleId, targetpermissionId: permissionId};
          await models.grant.create(grant, {transaction: t})
        }
      });
    };

    run().then( ()=> common.ressendsuccess(req, res) )
      .catch(common.catchsendmessage(req, res))
  }
};


/**
 * 设置每个角色的权限
 * 1、基础员工
 *
 * @param req
 * @param res
 */

exports.initRolePermission = (req, res) =>{
  let run = async ()=>{

    let basicP = [
      'getlist_paytype',
      'get_paytype',

      'get_subject',

      'getlist_company',
      'get_company',

      'getlist_vendor',
      'get_vendor',

      'getlist_reimuser',
      'get_reimuser',
      // reimuser 付款对象

      'getlist_reimuserdetail',
      'get_reimuserdetail',
      // 付款对象的详情

      'getlist_account',
      'get_account',

      'getlist_ldap',   // 获取 ldap 中的人员信息
      'getlist_department',   // 获取 ldap 中的所有部门
    ]

    let p = [
      'new_paytype',
      'delete_paytype',
      'update_paytype',
      // paytype 是付款类型 （car/ cola等）


      'delete_subject',
      'update_subject',
      // subject 是科目


      'new_company',
      'delete_company',
      'update_company',
      // company 公司

      'new_vendor',
      'delete_vendor',
      'update_vendor',
      // vendor 供应商




      'new_account',
      'delete_account',
      'update_account',
      // 员工信息

      'new_accountrole',  //给员工添加角色
      'delete_accountrole',  //删除员工角色
    ];

    let generalP = [
      'getlist_order', 'get_order', 'getlist_applylog', 'get_paidNo', 'getlist_ordersubject', 'get_ordersubject', 'print_order',
      'getlist_subject'
    ].concat(basicP)

    let permissions = {
      general : generalP,
      // 表示系统拥有该用户，可用于登录
      // 可以查看 order
      // applylog 审批日志
      // paidNo 付款单号
      // ordersubject 科目拆分数据

      applicant : [
        'new_order', 'delete_order', 'update_order', 'submit_order', 'abandon_order', 'backout_order',
        'update_cashierOrder', // 申请人能够在导出前对 order 进行有限的修改
        'applicantUpdate_order',  // 申请人能够在付款失败后，对 order 进行修改，然后提交
      ],
      // order 订单
      // submit 提交， abandon 废弃，print 打印， backout 撤回

      manager : [
        'managerAppro_order', 'managerRefuse_order'
      ],
      cashier : [
        'cashierAppro_order', 'cashierRefuse_order', 'cashierExport_order', 'cashierPaySucceed_order', 'cashierPayFailed_order',
        'update_cashierOrder', // 出纳能够对 order 进行有限的修改
        'update_orderInvoice',  // 出纳能够确认 order 的 invoice 是否收到
        'receive_printedOrder', // 出纳能够确认收到打印的 order
        'update_cashierUpdateAmount', // 出纳能够修改 order 的金额
        'update_receiveOrderStatus', // 出纳修改是否收到打印 order 的状态
      ],

      GL: [
        'new_ordersubject', 'getlist_ordersubject', 'get_ordersubject', 'delete_ordersubject', 'update_ordersubject',
        'print_voucher', // 打印付款凭证
        'download_voucher', // 下载付款凭证
      ],
      // GL 总账，能够对内部申请单进行科目拆分

      InterCompany: [
        'new_ordersubject', 'getlist_ordersubject', 'get_ordersubject', 'delete_ordersubject', 'update_ordersubject',
        'print_voucher', // 打印付款凭证
        'download_voucher', // 下载付款凭证
      ],
      // InterCompany 集团往来会计，能够对申请单进行科目拆分

      finance : [
        'financeAppro_order', 'financeRefuse_order', 'getlist_reimuser', 'get_reimuser', 'new_reimuserdetail', 'update_reimuserdetail', 'delete_reimuserdetail',

      ],
      // 能够查看 reimuser
      // 能够查看、新增、编辑、删除 reimuserdetail
      // 能够查看、新增、编辑、删除 ordersubject 科目拆分数据

      chief : [
        'chiefAppro_order', 'chiefRefuse_order'
      ],
      hr : [
        'new_reimuser', 'update_reimuser', 'delete_reimuser', 'getlist_reimuser', 'get_reimuser'
      ],
      // 能够查看、新增、编辑、删除 reimuser
      maintainer : p
      // 管理员能够对基础参数进行设置
    };


    let roleArr = [
      {id: 'general', name: '普通员工'},
      {id: 'manager', name: '主管'},
      {id: 'cashier', name: '出纳'},
      {id: 'GL', name: '总账'},
      {id: 'InterCompany', name: '集团往来会计'},
      {id: 'finance', name: '财务'},
      {id: 'chief', name: '财务总监'},
      {id: 'maintainer', name: '维护人员'},
      {id: 'hr', name: '人事'},
      {id: 'applicant', name: '申请人'},
    ];


    let accountArr = clone(roleArr).map((item)=>{
      if (item.id === 'applicant') {
        item.managerUsr = 'A_manager';
        item.directorUsr = 'A_manager_B';
      }
      item.id = 'A_' + item.id;
      return item
    });
    accountArr.unshift({id: 'A_manager_B', name: '另一个主管'});
    let accountrole = [];
    roleArr.forEach((item)=>{
      accountrole.push({accountId: 'A_' + item.id, roleId: item.id});
      if (item.id !== 'general'){
        accountrole.push({accountId: 'A_' + item.id, roleId: 'general'});
      }
    });
    accountrole.push({accountId: 'A_manager_B', roleId: 'manager'});
    accountrole.push({accountId: 'A_manager_B', roleId: 'general'});

    let targets = [
      {roleId: 'manager', targetroleId: 'general'},
      {roleId: 'applicant', targetroleId: 'general'},
      {roleId: 'cashier', targetroleId: 'general'},
      {roleId: 'GL', targetroleId: 'general'},
      {roleId: 'InterCompany', targetroleId: 'general'},
      {roleId: 'finance', targetroleId: 'GL'},
      {roleId: 'finance', targetroleId: 'InterCompany'},
      {roleId: 'chief', targetroleId: 'finance'},
      {roleId: 'maintainer', targetroleId: 'general'},
      {roleId: 'chief', targetroleId: 'maintainer'},
      {roleId: 'hr', targetroleId: 'general'},
      {roleId: 'admin', targetroleId: 'manager'},
      {roleId: 'admin', targetroleId: 'cashier'},
      {roleId: 'admin', targetroleId: 'chief'},
      {roleId: 'admin', targetroleId: 'maintainer'},
      {roleId: 'admin', targetroleId: 'hr'},
      {roleId: 'admin', targetroleId: 'applicant'},
    ];

    return await sequelize.transaction(async (t)=>{
      await models.accountrole.destroy({where: {accountId: {$notIn: ['superMan', 'shscan']}}, transaction: t});
      await models.grant.destroy({where: {roleId: {$notIn: ['admin']}}, transaction: t});
      await models.role.destroy({where: {id: {$ne: 'admin'}}, transaction: t});
      await models.account.destroy({where: {id: {$notIn: ['superMan', 'shscan']}}, transaction: t});
      await models.account.bulkCreate(accountArr, {transaction: t});
      await models.role.bulkCreate(roleArr, {transaction: t});
      let grants = [];
      roleArr.forEach((item)=>{
        permissions[item.id].forEach((pm)=>{
          grants.push({roleId: item.id, targetpermissionId: pm})
        });
      });
      await models.grant.bulkCreate(grants, {transaction: t});
      await models.grant.bulkCreate(targets, {transaction: t});
      await models.accountrole.bulkCreate(accountrole, {transaction: t});
    })
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};





/**
 * 初始化系统所必须的参数
 * 系统参数，参数详情
 * 付款公司，供应商，科目
 * 报销类型，报销对象，报销对象的预设费用
 * @param req
 * @param res
 */

exports.initArgs = (req, res) => {
  let run = async ()=>{
    let args = [
      [
        {id: 'category', name: '报销类型的类别', editFlag: n},
        [
          {id: 'employee', name: '员工类别', argmainId: 'category'},
          {id: 'operatingCost', name: '运营成本', argmainId: 'category'},
        ]
      ],[
        {id: 'payeeType', name: '收款人类别', editFlag: n},
        [
          {id: 'vendor', name: '供应商', argmainId: 'payeeType'},
          {id: 'reimuser', name: '报销人', argmainId: 'payeeType'},
        ]
      ],[
        {id: 'approType', name: '申请单待操作角色类别', editFlag: n},
        [
          {id: 'byAccount', name: '被用户审批', argmainId: 'approType'},
          {id: 'byRole', name: '被角色审批', argmainId: 'approType'},
        ]
      ],[
        {id: 'currency', name: '货币', editFlag: y},
        [
          {id: 'CNY', name: '人民币', argmainId: 'currency'},
          {id: 'USD', name: '美元', argmainId: 'currency'},
        ]
      ],[
        {id: 'approStatus', name: '当前审批状态', editFlag: n},
        [
          {id: 'toSubmit', name: '已创建，待提交', argmainId: 'approStatus'},
          {id: 'toApproByManager', name: '已提交，待主管审批', argmainId: 'approStatus'},
          {id: 'refusedByManager', name: '主管否决，待提交', argmainId: 'approStatus'},
          {id: 'toApproByCashier', name: '主管已批准，待出纳审核', argmainId: 'approStatus'},
          {id: 'refusedByCashier', name: '出纳否决，待提交', argmainId: 'approStatus'},
          {id: 'toApproByFinance', name: '出纳已审核，待财务审核', argmainId: 'approStatus'},
          {id: 'refusedByFinance', name: '财务否决，待提交', argmainId: 'approStatus'},
          {id: 'toApproByChief', name: '财务已审核，待财务总监审批', argmainId: 'approStatus'},
          {id: 'refusedByChief', name: '财务总监否决，待提交', argmainId: 'approStatus'},
          {id: 'toExportByCashier', name: '财务总监已审批，待出纳导出', argmainId: 'approStatus'},
          {id: 'toPayByCashier', name: '出纳已导出，待出纳付款', argmainId: 'approStatus'},
          {id: 'payFailed', name: '出纳付款失败，待出纳导出', argmainId: 'approStatus'},
          {id: 'updatedByApplicant', name: '申请人已修改信息，待出纳导出', argmainId: 'approStatus'},
          {id: 'paySucceed', name: '出纳付款成功', argmainId: 'approStatus'},
          {id: 'abandoned', name: '已废弃', argmainId: 'approStatus'},
        ]
      ],[
        {id: 'operation', name: '对申请单的操作', editFlag: n},
        [
          {id: 'create', name: '创建', argmainId: 'operation'},
          {id: 'submit', name: '提交', argmainId: 'operation'},
          {id: 'managerAppro', name: '主管批准', argmainId: 'operation'},
          {id: 'managerRefuse', name: '主管拒绝', argmainId: 'operation'},
          {id: 'cashierAppro', name: '出纳批准', argmainId: 'operation'},
          {id: 'cashierRefuse', name: '出纳拒绝', argmainId: 'operation'},
          {id: 'financeAppro', name: '财务批准', argmainId: 'operation'},
          {id: 'financeRefuse', name: '财务拒绝', argmainId: 'operation'},
          {id: 'chiefAppro', name: '总监批准', argmainId: 'operation'},
          {id: 'chiefRefuse', name: '总监拒绝', argmainId: 'operation'},
          {id: 'cashierExport', name: '出纳导出', argmainId: 'operation'},
          {id: 'cashierExportAgain', name: '出纳再次导出', argmainId: 'operation'},
          {id: 'cashierPaySucceed', name: '出纳付款成功', argmainId: 'operation'},
          {id: 'cashierPayFailed', name: '出纳付款失败', argmainId: 'operation'},
          {id: 'applicantUpdate', name: '申请人修改订单信息', argmainId: 'operation'},
          {id: 'abandon', name: '废弃', argmainId: 'operation'}
        ]
      ]
    ];
    let companys = [
      {id: '24787240-06da-11e7-b23d-513f39f5849c',name: 'GTB AP CENTRAL', logoPath: 'upload/20170327/logo1.png', code: 'BH'},
      {id: '24787241-06da-11e7-b23d-513f39f5849c',name: 'Prism', logoPath: 'upload/20170327/logo2.png', code: 'PR'},
      {id: '12387241-06da-11e7-b23d-513f39f5849c',name: 'GTB CHINA', logoPath: 'upload/20171213/93038f90-e002-11e7-ab0b-4501edb52f27.png', code: 'GC'}
    ];
    let vendors = [
      {id: '248a4c90-06da-11e7-b23d-513f39f5849c',name: '上海出租车', contacter: '强哥', telphone: '021-31313445', vendorType: 'company', code: 'code1', status: 0},
      {id: '248a73a0-06da-11e7-b23d-513f39f5849c',name: '上海餐饮', contacter: '华哥', telphone: '021-31313445', vendorType: 'company', code: 'code2', status: 0},
      {id: '123a73a0-06da-11e7-b23d-513f39f5849c',name: '个人供应商1', contacter: '个1', telphone: '021-31213345', vendorType: 'user', code: 'code3', status: 0},
    ];
    let vendorDetails = [
      {id: '69b6a690-0eca-11e7-8881-5f624753c8ec', bankNum: '111111111111111111', bankName: '上海银行'},
      {id: '69b769e0-0eca-11e7-8881-5f624753c8ec', bankNum: '222222222222222222', bankName: '中国银行'},
      {id: '789769e0-0eca-11e7-8881-5f624753c8ec', bankNum: '333333333333333333', bankName: '工商银行'},
    ];
    let subjects = [
      // 银行类别
      {id: '222a73a0-06da-11e7-b23d-513f39f5849c', name: 'HSBC_CNY_GTB', bankFlag: y, code: '8110-0098', bankNum: '088-560396-011', bankCode: 'HB', accountType: '11'},
      {name: 'BOC_CNY_GTB', bankFlag: y, code: '8110-201', bankNum: '444260849044', bankCode: 'BC', accountType: '11'},
      {name: 'BOC_USD_GTB', bankFlag: y, code: '8110-202', bankNum: '437760849017', bankCode: 'BC', accountType: '12'},
      {name: 'BOC_USD_CAPITAL_GTB', bankFlag: y, code: '8110-203', bankNum: '435160848962', bankCode: 'BC', accountType: '13'},
      {name: 'BOC_CONSTRUCTION_GTB', bankFlag: y, code: '8110-0091', bankNum: '445571948034', bankCode: 'BC', accountType: '14'},
      {name: 'CASH_CNY_GTB', bankFlag: y, code: '8120-001', bankNum: null, bankCode: 'CA', accountType: '11'},
      {name: 'HSBC_CNY_PR', bankFlag: y, code: '8110-0092', bankNum: '088-560396-012', bankCode: 'HB', accountType: '11'},
    ];

    // 非银行类别
    (xlsx.parse(path.join(__dirname, '../public/COA201801.xlsx')))[0].data.forEach((item) => {
      subjects.push({
        name: item[1], bankFlag: n, code: item[0]
      })
    });
    subjects[7].id = '111a73a0-06da-11e7-b23d-513f39f5849c';
    subjects[8].id = '801a73a0-06da-11e7-b23d-513f39f5849c';


    let paytypes = [
      {id: 'car', category: 'employee', description: '车贴'},
      {id: 'COLA', category: 'employee', description: '补贴', subjectId: '111a73a0-06da-11e7-b23d-513f39f5849c'},
      {id: 'paper', category: 'operatingCost', description: '纸张'},

      // 员工相关
      // {id: 'Salary-local payment', category: 'employee', description: '', rankNum: 1},
      // {id: 'Salary-oversea payment', category: 'employee', description: '', rankNum: 2},
      // {id: 'Freelancer', category: 'employee', description: '', rankNum: 3},
      // {id: 'Intern', category: 'employee', description: '', rankNum: 4},
      // {id: 'COLA', category: 'employee', description: '', rankNum: 5},
      // {id: 'Housing', category: 'employee', description: '', rankNum: 6},
      // {id: 'Car-fixed', category: 'employee', description: '', rankNum: 7},
      // {id: 'Car-daily', category: 'employee', description: '', rankNum: 8},
      // {id: 'Mobile-company', category: 'employee', description: '', rankNum: 9},
      // {id: 'Mobile-staff', category: 'employee', description: '', rankNum: 10},
      // {id: 'Medical', category: 'employee', description: '', rankNum: 11},
      // {id: 'Education', category: 'employee', description: '', rankNum: 12},
      // {id: 'Language', category: 'employee', description: '', rankNum: 13},
      // {id: 'Recruitment', category: 'employee', description: '', rankNum: 14},
      // {id: 'Relocation', category: 'employee', description: '', rankNum: 15},
      // {id: 'Individual Income Tax', category: 'employee', description: '', rankNum: 16},
      // {id: 'Social Insurances', category: 'employee', description: '', rankNum: 17},
      // {id: 'Housing Fund', category: 'employee', description: '', rankNum: 18},
      // {id: 'Others_Staff', category: 'employee', description: '', rankNum: 19},
      // {id: 'Cash Advance', category: 'employee', description: '', rankNum: 20},
      //
      // // 增加
      //
      // {id: 'Visa', category: 'employee', description: '', rankNum: 21},
      // {id: 'Travel', category: 'employee', description: '', rankNum: 22},
      // {id: 'Credit Card', category: 'employee', description: '', rankNum: 23},
      //
      //
      // // 运营成本
      // {id: 'Staff_Welfare_Cost', category: 'operatingCost', description: '', rankNum: 24},
      // {id: 'Office_Cost', category: 'operatingCost', description: '', rankNum: 25},
      // {id: 'Commercial_Cost', category: 'operatingCost', description: '', rankNum: 26},
      // {id: 'IT_Cost', category: 'operatingCost', description: '', rankNum: 27},
      // {id: 'Financial_Cost', category: 'operatingCost', description: '', rankNum: 28},

    ];

    let paytypedetails = [

      {id: 'car-1', paytypeId: 'car', description: '', rankNum: 1, subjectId: '111a73a0-06da-11e7-b23d-513f39f5849c'},
      {id: 'car-2', paytypeId: 'car', description: '', rankNum: 2, subjectId: '801a73a0-06da-11e7-b23d-513f39f5849c'},
      {id: 'paper-1', paytypeId: 'paper', description: '', rankNum: 3, subjectId: '111a73a0-06da-11e7-b23d-513f39f5849c'},
      {id: 'paper-2', paytypeId: 'paper', description: '', rankNum: 4, subjectId: '801a73a0-06da-11e7-b23d-513f39f5849c'},

      // Staff_Welfare_Cost 类别
      // {id: 'Training', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 1},
      // {id: 'Lunch & Learn', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 2},
      // {id: 'Bagel/Town Hall', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 3},
      // {id: '5@5', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 4},
      // {id: 'Holiday Gifts', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 5},
      // {id: 'Company Trip', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 6},
      // {id: "X'mas Party", paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 7},
      // {id: 'CNY Party', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 8},
      // {id: 'Red Packet', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 9},
      // {id: 'Team Building/Meals', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 10},
      // {id: 'Others_Staff_Welfare_Cost', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 11},
      //
      //
      // // Office_Cost 类别
      // {id: 'CAPEX', paytypeId: 'Office_Cost', description: '', rankNum: 1},
      // {id: 'Rental', paytypeId: 'Office_Cost', description: '', rankNum: 2},
      // {id: 'Management Fee', paytypeId: 'Office_Cost', description: '', rankNum: 3},
      // {id: 'Parking', paytypeId: 'Office_Cost', description: '', rankNum: 4},
      // {id: 'Utilities', paytypeId: 'Office_Cost', description: '', rankNum: 5},
      // {id: 'Facility Management', paytypeId: 'Office_Cost', description: '', rankNum: 6},
      // {id: 'Stationary', paytypeId: 'Office_Cost', description: '', rankNum: 7},
      // {id: 'Office Supplies', paytypeId: 'Office_Cost', description: '', rankNum: 8},
      // {id: 'Postage & Courier', paytypeId: 'Office_Cost', description: '', rankNum: 9},
      // {id: 'Storage', paytypeId: 'Office_Cost', description: '', rankNum: 10},
      // {id: 'Office Insurance', paytypeId: 'Office_Cost', description: '', rankNum: 11},
      // {id: 'Magazines', paytypeId: 'Office_Cost', description: '', rankNum: 12},
      // {id: 'Others_Office_Cost', paytypeId: 'Office_Cost', description: '', rankNum: 13},
      //
      // // Commercial_Cost 类别
      // {id: 'Travel', paytypeId: 'Commercial_Cost', description: '', rankNum: 1},
      // {id: 'Visa', paytypeId: 'Commercial_Cost', description: '', rankNum: 2},
      // {id: 'Management Meeting', paytypeId: 'Commercial_Cost', description: '', rankNum: 3},
      // {id: 'Client Entertainment', paytypeId: 'Commercial_Cost', description: '', rankNum: 4},
      // {id: 'Client Meeting', paytypeId: 'Commercial_Cost', description: '', rankNum: 5},
      // {id: 'Client Workshops', paytypeId: 'Commercial_Cost', description: '', rankNum: 6},
      // {id: 'Hot House (HH)', paytypeId: 'Commercial_Cost', description: '', rankNum: 7},
      // {id: 'Brand Breakthrough (BBT)', paytypeId: 'Commercial_Cost', description: '', rankNum: 8},
      // {id: 'Presentation', paytypeId: 'Commercial_Cost', description: '', rankNum: 9},
      // {id: 'Others_Commercial_Cost', paytypeId: 'Commercial_Cost', description: '', rankNum: 10},
      //
      //
      // // IT_Cost 类别
      // {id: 'Hardware-CAPEX', paytypeId: 'IT_Cost', description: '', rankNum: 1},
      // {id: 'Hardware-expense', paytypeId: 'IT_Cost', description: '', rankNum: 2},
      // {id: 'Software', paytypeId: 'IT_Cost', description: '', rankNum: 3},
      // {id: 'Printer', paytypeId: 'IT_Cost', description: '', rankNum: 4},
      // {id: 'Accessaries', paytypeId: 'IT_Cost', description: '', rankNum: 5},
      // {id: 'Repair', paytypeId: 'IT_Cost', description: '', rankNum: 6},
      // {id: 'Conference Call', paytypeId: 'IT_Cost', description: '', rankNum: 7},
      // {id: 'Landline', paytypeId: 'IT_Cost', description: '', rankNum: 8},
      // {id: 'Others_IT_Cost', paytypeId: 'IT_Cost', description: '', rankNum: 9},
      //
      //
      // // Financial_Cost 类别
      // {id: 'Internal Transfer', paytypeId: 'Financial_Cost', description: '', rankNum: 1},
      // {id: 'Intercompany', paytypeId: 'Financial_Cost', description: '', rankNum: 2},
      // {id: 'Cash Advance', paytypeId: 'Financial_Cost', description: '', rankNum: 3},
      // {id: 'Petty Cash', paytypeId: 'Financial_Cost', description: '', rankNum: 4},
      // {id: 'Bank Charges', paytypeId: 'Financial_Cost', description: '', rankNum: 5},
      // {id: 'VAT & Surtaxes', paytypeId: 'Financial_Cost', description: '', rankNum: 6},
      // {id: 'Corporate Income Tax', paytypeId: 'Financial_Cost', description: '', rankNum: 7},
      // {id: 'Withholding Tax', paytypeId: 'Financial_Cost', description: '', rankNum: 8},
      // {id: 'Audit', paytypeId: 'Financial_Cost', description: '', rankNum: 9},
      // {id: 'Legal', paytypeId: 'Financial_Cost', description: '', rankNum: 10},
      // {id: 'Tax Agent', paytypeId: 'Financial_Cost', description: '', rankNum: 11},
      // {id: 'Tax Consulting', paytypeId: 'Financial_Cost', description: '', rankNum: 12},
      // {id: 'Dividends', paytypeId: 'Financial_Cost', description: '', rankNum: 13},
      // {id: 'Dividends Tax', paytypeId: 'Financial_Cost', description: '', rankNum: 14},
      // {id: 'Others_Financial_Cost', paytypeId: 'Financial_Cost', description: '', rankNum: 15},
    ];


    let reimusers = [
      [
        {id: '24941090-06da-11e7-b23d-513f39f5849c',name: 'Robet'},
        [
          {paytypeId: 'car', paytypedetailId: 'car-1', money: 1000, validDate: '2017-02', vendordetailId: '69b6a690-0eca-11e7-8881-5f624753c8ec'},
          {paytypeId: 'paper', paytypedetailId: 'paper-1', money: 3000, validDate: '2017-02', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
          {paytypeId: 'COLA', money: 3000, validDate: '2017-02', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
        ]
      ],[
        {id: '24a6ae30-06da-11e7-b23d-513f39f5849c',name: 'Blues'},
        [
          {paytypeId: 'car', paytypedetailId: 'car-2', money: 1000, validDate: '2017-02', vendordetailId: '69b6a690-0eca-11e7-8881-5f624753c8ec'},
          {paytypeId: 'paper', paytypedetailId: 'paper-2', money: 3000, validDate: '2017-02', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
        ]
      ],[
        {id: '56a6ae30-06da-11e7-b23d-513f39f5849c',name: appcfg.publicCost},
        []
      ],[
        {id: '10a6ae30-06da-11e7-b23d-513f39f5849c',name: appcfg.others},
        []
      ]
    ];

    await sequelize.transaction(async (t)=>{

      await models.reimuserdetail.destroy({where:{status: 1}, transaction: t});
      await models.reimuser.destroy({where:{status: 1}, transaction: t});
      await models.paytypedetail.destroy({where:{status: 1}, transaction: t});
      await models.paytype.destroy({where:{status: 1}, transaction: t});
      await models.subject.destroy({where:{status: 1}, transaction: t});
      await models.company.destroy({where: {status: 1}, transaction: t});
      await models.vendordetail.destroy({where:{status :1}, transaction: t});
      await models.vendor.destroy({where:{status :1}, transaction: t});
      await models.argmain.destroy({where: {status: 1}, transaction: t});
      await models.argdetail.destroy({where: {status: 1}, transaction: t});

      for (let i = 0, len = args.length; i < len; i++){
        await models.argmain.create(args[i][0], {transaction: t});
        await models.argdetail.bulkCreate(args[i][1], {transaction: t});
      }
      await models.subject.bulkCreate(subjects, {transaction: t});
      await models.paytype.bulkCreate(paytypes, {transaction: t});
      await models.paytypedetail.bulkCreate(paytypedetails, {transaction: t});
      await models.company.bulkCreate(companys, {transaction: t});
      let vendorObjs = await models.vendor.bulkCreate(vendors,{transaction: t});
      for (let i = 0, len = vendorObjs.length; i < len; i++){
        vendorDetails[i].vendorId = vendorObjs[i].id;
        await models.vendordetail.create(vendorDetails[i], {transaction: t})
      }
      for (let i = 0, len = reimusers.length; i < len; i++){
        let reimuser = await models.reimuser.create(reimusers[i][0], {transaction: t});
        reimusers[i][1].forEach((item)=>{
          item.reimuserId = reimuser.id
        });
        await models.reimuserdetail.bulkCreate(reimusers[i][1], {transaction: t});
      }
    })
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

/**
 * 删除所有的表，重建所有的表
 * @param req
 * @param res
 */
exports.dropAll = (req, res) => {
  let run = async ()=>{
    await sequelize.drop();
    await sequelize.sync();
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

/**
 * 删除order，及其对应的文件
 * @param req
 * @param res
 */
exports.dropOrder = (req, res) => {
  let run = async ()=>{
    let args = {};
    await sequelize.transaction(async(t)=>{
      if(
        common.getreqparameter(req, res, args, 'description', true)
      ){
        let orderIdArr = (await models.order.findAll({
          transaction: t
        })).map((item) => {
          return item.dataValues.id;
        });
        await models.applylog.destroy({
          transaction: t,
          where: {orderId: {$in: orderIdArr}}
        });
        await models.orderdetail.destroy({
          transaction: t,
          where: {orderId: {$in: orderIdArr}}
        });
        await models.ordersubject.destroy({
          transaction: t,
          where: {orderId: {$in: orderIdArr}}
        });
        await models.order.destroy({
          transaction: t,
          where: {id: {$in: orderIdArr}}
        });
      }
    });
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

exports.dropReimuser = (req, res) => {
  let run = async ()=>{
    let args = {};
    await sequelize.transaction(async(t)=>{
      if(
        common.getreqparameter(req, res, args, 'id', true)
      ){
        await models.reimuserdetail.destroy({where: {reimuserId: args.id}, transaction: t});
        await models.reimuser.destroy({where: {id: args.id}, transaction: t});
      }
    });
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

exports.createOrder = (req, res) => {
  let run = async() => {
    let args = {};
    let host = 'http://localhost:9500/';
    let order = {
      "description" : "测试订单",
      "remark" : "备注",
      "companyId" : "24787240-06da-11e7-b23d-513f39f5849c",
      "currency" : "CNY",
      "details" : [{
        "money" : "1000",
        "payDate" : null,
        "bankNum" : "4444444444444444444444",
        "bankName" : "朝鲜银行",
        "paytypeId" : "paper",
        "reimuserId" : null,
        "vendorName" : "248a4c90-06da-11e7-b23d-513f39f5849c",
        "payeeType" : "vendor",
        "contacter" : "胖哥",
        "telphone" : "021-14141414",
        "remark" : "备注"
      },{
        "money" : "1000",
        "payDate" : null,
        "bankNum" : "5555555555555555555555555555",
        "bankName" : "开发银行",
        "paytypeId" : "paper",
        "reimuserId" : null,
        "vendorName" : "248a4c90-06da-11e7-b23d-513f39f5849c",
        "payeeType" : "vendor",
        "contacter" : "胖哥",
        "telphone" : "021-14141414",
        "remark" : "备注"
      }]
    };
    if (
      common.getreqparameter(req, res, args, 'approStatus', true)
    ) {
      await fetch(host + 'login', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: "A_general",
          password: "123"
        })
      });
      //创建
      let c_order = await fetch(host + 'orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: order
      });
      if (args.approStatus == approStatus.toSubmit) return;

      //提交
      await fetch(host + `submit/orders/${c_order.dataValues.id}`, {
        method: 'PUT', body: {"accountId": "A_manager"}
      });
      if (args.approStatus == approStatus.toApproByManager) return;

      if (args.approStatus == approStatus.refusedByManager){
        //主管否决
        await fetch(host + `managerRefuse/orders/${c_order.dataValues.id}`, {
          method: 'PUT'
        });
        return ;
      }

      //主管批准
      await fetch(host + `managerAppro/orders/${c_order.dataValues.id}`, {
        method: 'PUT'
      });
      if (args.approStatus == approStatus.toApproByCashier) return;
    }
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};

exports.dropAccount = (req, res) => {
  let run = async ()=>{
    let args = {};
    await sequelize.transaction(async(t)=>{
      if(
        common.getreqparameter(req, res, args, 'id', true)
      ){
        await models.accountrole.destroy({where: {accountId: args.id}, transaction: t});
        await models.account.destroy({where: {id: args.id}, transaction: t});
      }
    });
  };
  run().then( ()=> common.ressendsuccess(req, res) )
    .catch(common.catchsendmessage(req, res))
};