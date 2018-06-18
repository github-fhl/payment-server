module.exports = {

  status: {
    normal: 1,
    deleted: 0
  },

  Y: 'Y',
  N: 'N',

  // 境外付款银行的 code 类别
  bankCodeType: {
    'SWIFT BIC': 'SWIFT BIC',
    'Australia-BSB Cod': 'Australia-BSB Cod',
    'Canada- Routing Nu': 'Canada- Routing Nu',
    'China-CNAPS': 'China-CNAPS',
    'Germany-Bankleitz': 'Germany-Bankleitz',
    'Hong Kong-Bank C': 'Hong Kong-Bank C',
    'Singapore-Bank Co': 'Singapore-Bank Co',
    'United Kingdom-Sort Code': 'United Kingdom-Sort Code',
    'United States-Fedwi': 'United States-Fedwi',
    'United States-CHIPS': 'United States-CHIPS',
  },

  orderType: {
    Payment: 'Payment',
    OverseasPayment: 'OverseasPayment',
    Expense: 'Expense',
  },

  operate: {
    create: 'create',
    delete: 'delete',
    update: 'update',
  },

  // 银行初始余额
  amount: {
    'HSBC_CNY_GTB': 10000,
    'BOC_CNY_GTB': 10000,
    'BOC_USD_GTB': 10000,
    'BOC_USD_CAPITAL_GTB': 10000,
    'BOC_CONSTRUCTION_GTB': 10000,
    'CASH_CNY_GTB': 10000,
    'HSBC_CNY_PR': 10000,
    'HSBC_CNY_GTBC': 10000
  },

  // 银行对账单类别
  statementType: {
    order: 'order', // 付款单
    receipt: 'receipt', // 收款单
  },

  // 银行流水的费用类别
  costType: {
    Inhouse: 'Inhouse',
    Production: 'Production'
  },

  // 交易类型
  transactionType: {
    Payment: 'Payment',
    Receipt: 'Receipt'
  },

  // 付款公司与归属公司不同时的科目 code
  diffSubjectCode: '8350-003',

  // 凭空创建的银行流水，对应的名称
  nullName: 'Bank Statement',

  // orderdetail 中 jobId 以 FFM/LOOP/FOOP/JMC 开头的
  specialItem: {
    FFM: {
      key: 'FFM',
      paytype: 'JWT HK'
    },
    LOOP: {
      key: 'LOOP',
      paytype: 'OOP'
    },
    FOOP: {
      key: 'FOOP',
      paytype: 'OOP'
    },
    JMC: {
      key: 'JMC',
      paytype: 'JMC'
    },
  }
}
