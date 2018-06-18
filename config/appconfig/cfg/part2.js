exports.y = 'y';
exports.n = 'n';
exports.f = 'f'; // false，错误

exports.signaturePath = '/public/signatures/';
exports.logoPath = '/public/logos/';

//报销类型的类别
exports.category = {
  employee: 'employee',  //员工类别
  operatingCost: 'operatingCost',  //运营费用
};

//收款人类别
exports.payeeType = {
  vendor: 'vendor',  //供应商
  reimuser: 'reimuser',  //报销人
};

//申请单待操作角色类别
const approType = {
  byAccount: 'byAccount',  //被用户审批
  byRole: 'byRole',  //被角色审批
};
exports.approType = approType;

//货币
exports.currency = {
  CNY: 'CNY',  //人民币
  USD: 'USD',  //美元
};

exports.approStatus = require('../flowCfg').orderStatus

//待提交的状态
exports.toApply = ['toSubmit', 'refusedByManager', 'refusedByCashier', 'refusedByFinance', 'refusedByChief']
exports.applying = ['toApproByManager', 'toApproByCashier', 'toApproByFinance', 'toApproByChief', 'toExportByCashier', 'toExportByCashier', 'toPayByCashier', 'payFailed', 'updatedByApplicant']
exports.applyed = ['paySucceed', 'abandoned']

exports.backout = 'backout'; // 撤回的操作

const operation = require('../flowCfg').orderOperation
exports.operation = operation
//applylog是否被操作
exports.applyStatus = {
  toHandle: 'toHandle', //待操作
  handling: 'handling', //正在操作
  handled: 'handled',  //已操作
}


//role的类型
exports.roles = {
  admin: 'admin', // '管理员'
  hr: 'hr', // '人事'
  cashier: 'cashier', // '出纳'
  GL: 'GL', // '总账'
  InterCompany: 'InterCompany', // '集团往来会计'
  finance: 'finance', // '财务'
  chief: 'chief', // '财务总监'
  general: 'general', // '普通员工'
  applicant: 'applicant', // '申请人'
  maintainer: 'maintainer', // '维护人员'
  manager: 'manager', // '主管'
}


//生成ID的类别
exports.idType = {
  order: 'order'
}

//常用移除属性
exports.removeAttrs = ['updatedAt', 'createdUsr', 'updatedUsr']

//装饰结果的数据表数组
exports.decorateModels = {
  modelArr: ['company', 'vendor', 'reimuser', 'paytype', 'subject'],
  fieldArr: [['name', 'code'], ['name', 'code'], ['name'], ['category'], ['name', 'code', 'bankNum']]
}

//出纳执行操作的类别
exports.cashierType = {
  approve: [operation.managerAppro],   //审核
  pay: [operation.financeAppro, operation.chiefAppro, operation.cashierExport, operation.applicantUpdate],   //付款
}

//log根据页面进行分类
exports.logType = {
  order: [operation.create, operation.managerRefuse, operation.cashierRefuse, operation.financeRefuse, operation.chiefRefuse],
  managerAppro: [operation.submit],
  cashierAppro: [operation.managerAppro],
  icAppro: [operation.cashierApproToIC],
  financeAppro: [operation.cashierAppro, operation.icAppro],
  chiefAppro: [operation.financeAppro],
  cashierPay: [operation.chiefAppro, operation.cashierPay, operation.applicantUpdate]
}

//拒绝的操作
exports.rejectArr = [operation.managerRefuse, operation.cashierRefuse, operation.financeRefuse, operation.chiefRefuse, operation.cashierPayFailed, operation.abandon];
//批量的操作
exports.bulkOperation = [operation.financeAppro, operation.chiefAppro, operation.cashierExport, operation.cashierPaySucceed, operation.cashierPayFailed, operation.applicantUpdate];

//借贷
exports.subjectType = {
  debit: 'debit', //借（order 中借方多）
  credit: 'credit' //贷
}

//银行前缀
exports.bankPrefix = {
  "中国银行": "BOC",
  "科目1": "KM1"
}

// 对应的角色所属关系
exports.ownRoles = {
  general: ['general'],
  applicant: ['general', 'applicant'],
  hr: ['general', 'hr'],
  finance: ['general', 'finance'],
  chief: ['general', 'finance', 'chief'],
  cashier: ['general', 'cashier'],
  maintainer: ['general', 'maintainer'],
  manager: ['general', 'manager'],
  admin: ['general', 'cashier', 'manager', 'maintainer', 'chief', 'hr', 'finance'],
}

// 订单的金额分界点，如果小于则将 order 提交给主管，大于等于则提交给部门总监
exports.gapMoney = 20000;

// order 中的 vendorType
exports.vendorType = {
  user: 'user',
  company: 'company'
}

// order 订单号的前缀
exports.orderPrix = 'PR';

// 对 detail 的操作
exports.operate = {
  new: 'new',
  delete: 'delete',
  update: 'update',
  noChange: 'noChange'
};


// 公共成本中心
exports.publicCost = 'publicCost';
// 不用检查限额的成本中心
exports.others = 'others'

// 付款单号、收款单号
exports.payOrReceive = {
  P: 'P',
  R: 'R',
  Payment: 'P',
  Receipt: 'R'
};

// 申请单类别
exports.paymentType = {
  I: 'I', // 内部的申请单
  P: 'P', // production 类别的申请单
  Inhouse: 'I',
  Production: 'P'
};
