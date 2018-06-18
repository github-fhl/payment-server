/* eslint-disable */

const
    Sequelize = require('sequelize')
  , cfg = require('../config/appconfig/cfg')
  , flowCfg = require('../config/appconfig/flowCfg')
  ;

module.exports = (sequelize)=>{

  const account = sequelize.define("account", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 唯一ID，域账户用户名
    name: {type: Sequelize.STRING , allowNull: false, }, // 姓名，
    department: {type: Sequelize.STRING ,}, // 部门，
    title: {type: Sequelize.STRING ,}, // 职位，
    mail: {type: Sequelize.STRING ,}, // 邮箱，
    telephoneNumber: {type: Sequelize.STRING ,}, // 分机号，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['department']},
      {method: 'BTREE',fields: ['title']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '用户'
  });

  const signature = sequelize.define("signature", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // 签名ID，
    path: {type: Sequelize.STRING , allowNull: false, }, // 签名保存地址，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['path']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '用户签名表'
  });

  const role = sequelize.define("role", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 角色ID，
    name: {type: Sequelize.STRING , allowNull: false, }, // 角色名，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '角色'
  });

  const accountrole = sequelize.define("accountrole", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 当前状态，默认1，是否被删除
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '用户角色关联表'
  });

  const permission = sequelize.define("permission", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 权限ID，操作方式+操作对象
    object: {type: Sequelize.STRING , allowNull: false, }, // 操作对象，
    operation: {type: Sequelize.STRING , allowNull: false, }, // 操作方式，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 当前状态，
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '权限表'
  });

  const grant = sequelize.define("grant", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 当前状态，默认1，是否被删除
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '角色权限关联表'
  });

  const applylog = sequelize.define("applylog", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    operation: {type: Sequelize.STRING ,}, // 对申请单的操作，创建、删除、提交主管审批、提交(申请单状态)
    applyStatus: {type: Sequelize.ENUM('toHandle','handled') , defaultValue: 'toHandle', }, // 审批状态，待操作、已操作
    time: {type: Sequelize.INTEGER , defaultValue: 1, }, // 次数，废弃，记录申请单第几次来到申请节点，需要每次都查一下当前是第几次
    approType: {type: Sequelize.STRING ,}, // 审批类别，byAccount、byRole，两种审批类别
    remark: {type: Sequelize.STRING ,}, // 备注，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['applyStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '审批申请log'
  });

  const order = sequelize.define("order", {
    id: {type: Sequelize.STRING , primaryKey: true, readOnly: true, }, // 申请单ID，有规则待确认
    orderType: {type: Sequelize.ENUM , values: Object.values(cfg.orderType) ,}, // 申请单类别（2.0），境内 payment、海外 payment、报销
    description: {type: Sequelize.STRING ,}, // 描述，order分为三种人：报销申请人、花钱出去的人、收款的人
    applyDate: {type: Sequelize.DATE , readOnly: true, }, // 申请日期，
    amount: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 总金额，
    bankCharge: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 银行手续费（2.0 补充），
    subjectStatus: {type: Sequelize.ENUM('y','n','f') , defaultValue: 'n',  readOnly: true, }, // 科目拆分状态，f 代表科目拆分后，出纳修改了金额，然后的状态
    currency: {type: Sequelize.ENUM , values: Object.values(cfg.currency) ,}, // 货币，
    amountCNY: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 换算为人民币的钱（2.0 补充），非人民币需要填写
    excRate: {type: Sequelize.DECIMAL(18,6) , defaultValue: 1, }, // 汇率 （2.0 补充），amountCNY/amount
    printStatus: {type: Sequelize.ENUM('y','n') , defaultValue: 'n',  readOnly: true, }, // 打印状态，
    exportStatus: {type: Sequelize.ENUM('y','n') , defaultValue: 'n', }, // 导出状态（2.0 补充），
    paidDate: {type: Sequelize.DATE , readOnly: true, }, // 付款日期，
    subjectDate: {type: Sequelize.STRING , readOnly: true,  _description: '1701', }, // 拆分科目年月，根据 paidDate 生成
    voucherDate: {type: Sequelize.DATE , readOnly: true, }, // 凭证归属日期，打印凭证时，录入，默认为付款日期
    invoiceStatus: {type: Sequelize.ENUM('y','n', 'noNeed') , defaultValue: 'n',  readOnly: true, }, // 是否收到发票，不需要
    receiveOrderStatus: {type: Sequelize.ENUM('y','n') , defaultValue: 'n',  readOnly: true, }, // 出纳是否收到打印的 order，
    vendorType: {type: Sequelize.ENUM('user','company') ,}, // 判断给个人还是公司，
    approStatus: {type: Sequelize.STRING , readOnly: true, }, // 审批状态，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['applyDate']},
      {method: 'BTREE',fields: ['subjectStatus']},
      {method: 'BTREE',fields: ['printStatus']},
      {method: 'BTREE',fields: ['invoiceStatus']},
      {method: 'BTREE',fields: ['vendorType']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '申请单'
  });

  const orderdetail = sequelize.define("orderdetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    money: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0,  allowNull: false, }, // 金额，
    payDate: {type: Sequelize.STRING , _description: '2017-01', }, // 报销金额对应时间，保存年月信息
    vendorAddress: {type: Sequelize.STRING ,}, // 供应商地址(2.0)，
    payeeType: {type: Sequelize.STRING ,}, // 收款人类别，收款人对象可能是报销对象 / 供应商
    bankNum: {type: Sequelize.STRING ,}, // 银行账号，
    bankName: {type: Sequelize.STRING ,}, // 银行名称，
    bankAddress: {type: Sequelize.STRING ,}, // 银行地址（2.0），
    bankCodeType: {type: Sequelize.ENUM , values: Object.values(cfg.bankCodeType) ,}, // 银行代号类别（2.0），
    bankCode: {type: Sequelize.STRING ,}, // 银行代号（2.0），
    country: {type: Sequelize.STRING ,}, // 国家地区（2.0），
    formId: {type: Sequelize.STRING ,}, // 报销 Excel 中的编号（2.0），
    jobId: {type: Sequelize.STRING ,}, // chargeable 报销 Excel 中的特别标识，
    contacter: {type: Sequelize.STRING ,}, // 联系人，
    telphone: {type: Sequelize.STRING ,}, // 电话，
    remark: {type: Sequelize.STRING ,}, // 备注，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '申请单详情'
  });

  const paytype = sequelize.define("paytype", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 类型ID，
    category: {type: Sequelize.STRING , allowNull: false, }, // 报销类型的类别，用户类别、运营成本
    description: {type: Sequelize.STRING ,}, // 描述，
    rankNum: {type: Sequelize.INTEGER , defaultValue: 1000,  readOnly: true, }, // 排序字段，排序
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '报销类型'
  });

  const paytypedetail = sequelize.define("paytypedetail", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 类型ID，
    description: {type: Sequelize.STRING ,}, // 描述，
    rankNum: {type: Sequelize.INTEGER , defaultValue: 1000,  readOnly: true, }, // 排序字段，排序
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING , readOnly: true, }, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '报销类型详情表'
  });

  const subject = sequelize.define("subject", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    name: {type: Sequelize.STRING ,}, // 名称，
    bankFlag: {type: Sequelize.ENUM('y','n') , defaultValue: 'n', }, // 是否为银行属性，
    description: {type: Sequelize.STRING ,}, // 描述，
    code: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 科目代号，
    accountType: {type: Sequelize.STRING , _description: '11,12,13', }, // 账户类别，
    bankNum: {type: Sequelize.STRING , unique: true, }, // 银行账号，
    bankCode: {type: Sequelize.STRING ,}, // 银行代号，
    currency: {type: Sequelize.ENUM , values: Object.values(cfg.currency) ,}, // 币种，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['bankFlag']},
      {method: 'BTREE',fields: ['code']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '科目管理'
  });

  const argmain = sequelize.define("argmain", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ，
    name: {type: Sequelize.STRING ,}, // 名称，
    editFlag: {type: Sequelize.ENUM('y','n') , defaultValue: 'y', }, // 是否可编辑，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['editFlag']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '系统参数'
  });

  const argdetail = sequelize.define("argdetail", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // ，
    name: {type: Sequelize.STRING ,}, // 名称，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '系统参数详情'
  });

  const company = sequelize.define("company", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // 公司ID，
    name: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 公司名称，
    bankNum: {type: Sequelize.STRING ,}, // 公司账户，
    telphone: {type: Sequelize.STRING ,}, // 电话，
    logoPath: {type: Sequelize.STRING ,}, // logo路径，使用时，process.cwd()
    code: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 公司代号，
    codeToVoucher: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 给 voucher 用的 code，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '付款公司'
  });

  const vendor = sequelize.define("vendor", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    name: {type: Sequelize.STRING , allowNull: false,  unique: true, }, // 供应商名称，
    contacter: {type: Sequelize.STRING ,}, // 联系人，
    telphone: {type: Sequelize.STRING ,}, // 电话，
    vendorType: {type: Sequelize.ENUM('user','company') , defaultValue: 'company', }, // 类别，对于报销人员，就是个人类别的供应商
    code: {type: Sequelize.STRING ,}, // 手工维护的内部 code，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['vendorType']},
      {method: 'BTREE',fields: ['code']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '供应商'
  });

  const vendordetail = sequelize.define("vendordetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    bankNum: {type: Sequelize.STRING , allowNull: false, }, // 银行账号，
    bankName: {type: Sequelize.STRING , allowNull: false, }, // 银行名称，
    payDate: {type: Sequelize.DATE , readOnly: true, }, // 上次付款成功时间，
    vendorAddress: {type: Sequelize.STRING ,}, // 供应商地址（2.0），
    country: {type: Sequelize.STRING ,}, // 国家地区（2.0），
    bankAddress: {type: Sequelize.STRING ,}, // 银行地址（2.0），
    bankCodeType: {type: Sequelize.ENUM , values: Object.values(cfg.bankCodeType) ,}, // 银行代号类别（2.0），
    bankCode: {type: Sequelize.STRING ,}, // 银行代号（2.0），
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['payDate']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '供应商详情'
  });

  const reimuser = sequelize.define("reimuser", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    name: {type: Sequelize.STRING , allowNull: false, }, // 报销对象名称，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['name']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '报销对象'
  });

  const reimuserdetail = sequelize.define("reimuserdetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1,  readOnly: true, }, // ，
    money: {type: Sequelize.DECIMAL(18,6) , allowNull: false, }, // 金额，
    validDate: {type: Sequelize.STRING , allowNull: false,  _description: '2017-05', }, // 生效年月，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['validDate']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '报销对象的预设费用详情'
  });

  const receipt = sequelize.define("receipt", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // RE201805001，
    payer: {type: Sequelize.STRING ,}, // 付款方，
    description: {type: Sequelize.STRING ,}, // 描述，
    currency: {type: Sequelize.STRING , allowNull: false, }, // 币种，
    amount: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0,  allowNull: false, }, // 收款金额，
    bankCharge: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0,  allowNull: false, }, // 银行手续费，
    amountCNY: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 换算为人民币的钱，非人民币需要填写
    excRate: {type: Sequelize.DECIMAL(18,6) , defaultValue: 1, }, // 汇率，amountCNY/amount
    collectBalanceId: {type: Sequelize.STRING ,}, // Production 系统中回款配平 ID，
    collectDate: {type: Sequelize.DATEONLY , allowNull: false, }, // 收款日期，
    voucherDate: {type: Sequelize.DATEONLY ,}, // 凭证日期，
    subjectStatus: {type: Sequelize.ENUM('y','n','f') , defaultValue: 'n',  readOnly: true, }, // 科目拆分状态，f 代表科目拆分后，出纳修改了金额，然后的状态
    filePath: {type: Sequelize.STRING ,}, // 文件路径，
    remark: {type: Sequelize.STRING ,}, // 备注，
    status: {type: Sequelize.INTEGER , defaultValue: 1,  readOnly: true, }, // 状态，1：存在；0：删除
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['subjectStatus']},
      {method: 'BTREE',fields: ['status']},
      
    ],
    description: '收据（2.0 添加）'
  });

  const bankStatement = sequelize.define("bankStatement", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，
    index: {type: Sequelize.INTEGER , allowNull: false, }, // 流水号，
    date: {type: Sequelize.DATEONLY , allowNull: false, }, // 交易日期，
    type: {type: Sequelize.ENUM , values: Object.values(cfg.statementType) ,}, // 类型，
    transactionType: {type: Sequelize.ENUM , values: Object.values(cfg.transactionType) ,}, // 交易类型，
    description: {type: Sequelize.STRING ,}, // 描述，
    money: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 交易金额，
    bankCharge: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 银行手续费，
    balance: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 银行余额，
    costType: {type: Sequelize.ENUM , values: Object.values(cfg.costType) ,}, // 费用类型，inhouse / production
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['id']},
      
    ],
    description: ''
  });

  const voucher = sequelize.define("voucher", {
    id: {type: Sequelize.STRING , primaryKey: true,}, // 凭证号，
    voucherDate: {type: Sequelize.DATEONLY , allowNull: false, }, // 凭证日期，
    transactionType: {type: Sequelize.ENUM , values: Object.values(cfg.transactionType) ,}, // 交易类型，
    costType: {type: Sequelize.ENUM , values: Object.values(cfg.costType) ,}, // 费用类型，inhouse / production
    flowStatus: {type: Sequelize.ENUM , values: Object.values(flowCfg.voucherStatus) , allowNull: false, }, // 流程状态，
    remark: {type: Sequelize.STRING ,}, // 备注，
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: ''
  });

  const voucherdetail = sequelize.define("voucherdetail", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，高承毅
    money: {type: Sequelize.DECIMAL(18,6) , defaultValue: 0, }, // 金额，
    remark: {type: Sequelize.STRING ,}, // 备注，
    bankFlag: {type: Sequelize.ENUM('y', 'n') , allowNull: false, }, // 是否是银行，
    type: {type: Sequelize.ENUM('debit','credit') , allowNull: false, }, // 借贷类别，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['id']},
      {method: 'BTREE',fields: ['type']},
      
    ],
    description: ''
  });

  const excRate = sequelize.define("excRate", {
    id: {type: Sequelize.UUID , primaryKey: true, defaultValue: Sequelize.UUIDV1, }, // ，高承毅
    date: {type: Sequelize.DATEONLY , allowNull: false, }, // 归属年月，
    currency: {type: Sequelize.ENUM , values: Object.values(cfg.currency) , allowNull: false, }, // 币种，
    rate: {type: Sequelize.DECIMAL(18,6) , defaultValue: 1, }, // 汇率，
  },{
    freezeTableName: true,
    indexes:[
      {method: 'BTREE',fields: ['id']},
      
    ],
    description: ''
  });
};
