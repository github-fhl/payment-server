const
  {modelPath} = require('config'),
  {models, sequelize} = require(modelPath),
  clone = require('clone')

module.exports = async function (t) {

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
    'getlist_order', 'get_order', 'getlist_applylog', 'get_paidNo', 'print_order',
    'getlist_subject'
  ].concat(basicP)

  let permissions = {
    general : generalP,
    // 表示系统拥有该用户，可用于登录
    // 可以查看 order
    // applylog 审批日志
    // paidNo 付款单号

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
      'print_voucher', // 打印付款凭证
      'download_voucher', // 下载付款凭证
    ],
    // GL 总账，能够对内部申请单进行科目拆分

    InterCompany: [
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


  accountArr = [
    ...accountArr,
    {id: 'halu', name: 'Haze Lu', department: 'Finance GTB_AP_CN_SHA', title: 'Finance Manager', mail: 'haze.lu@gtb.com', telphoneNumber: '+86 21 22877605'},
    {id: 'levin.gong', name: 'Levin Gong', department: 'Finance GTB_AP_CN_SHA', title: '', mail: 'levin.gong@gtb.com', telphoneNumber: '+8621 22877713'},
    {id: 'nxu', name: 'Nancy Xu', department: 'Finance GTB_AP_CN_SHA', title: 'Junior Accountant', mail: 'nancy.xu@gtb.com', telphoneNumber: '+86 21 22877659'},
    {id: 'qiwang', name: 'Qing Wang', department: 'Talent/Human Resources GTB_AP_CN_SHA', title: 'HR Assistant', mail: 'qing.wang@gtb.com', telphoneNumber: '+86 21 22877668'},
    {id: 'shelke.wu', name: 'Shelke Wu', department: 'Finance GTB_AP_CN_SHA', title: 'Accountant', mail: 'shelke.wu@gtb.com', telphoneNumber: '+8621 22877704'},
    {id: 'tyee', name: 'Tian Yee', department: 'Finance GTB_AP_CN_SHA', title: 'Finance Director', mail: 'tian.yee@gtb.com', telphoneNumber: '+86 21 22877728'},
    {id: 'yxu', name: 'Yolanda X', department: 'Finance GTB_AP_CN_SH', title: 'Accountan', mail: 'yolanda.xu@gtb.co', telphoneNumber: '+86 21 2287768'},
  ]

  accountrole = [
    ...accountrole,
    {accountId: 'levin.gong', roleId: 'general'},
    {accountId: 'levin.gong', roleId: 'cashier'},
    {accountId: 'tyee', roleId: 'general'},
    {accountId: 'tyee', roleId: 'chief'},
    {accountId: 'tyee', roleId: 'maintainer'},
    {accountId: 'shelke.wu', roleId: 'general'},
    {accountId: 'shelke.wu', roleId: 'GL'},
    {accountId: 'yxu', roleId: 'general'},
    {accountId: 'yxu', roleId: 'GL'},
    {accountId: 'nxu', roleId: 'general'},
    {accountId: 'nxu', roleId: 'InterCompany'},
    {accountId: 'qiwang', roleId: 'general'},
    {accountId: 'qiwang', roleId: 'hr'},
    {accountId: 'halu', roleId: 'general'},
    {accountId: 'halu', roleId: 'finance'},
  ]

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
}
