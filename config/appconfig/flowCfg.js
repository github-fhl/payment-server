//当前审批状态
exports.expenseStatus = {
  toSubmit: 'toSubmit',  //已创建，待提交
  toApproByFinance: 'toApproByFinance', // 已提交，待财务经理审批
  refusedByFinance: 'refusedByFinance',  //财务经理否决，待提交
  toPayByCashier: 'toPayByCashier',  //财务经理已审核，待出纳导出银行信息
  toConfirmSucceed: 'toConfirmSucceed',  //出纳已付款，待确认
  payFailed: 'payFailed',//出纳付款退回
  paySucceed: 'paySucceed',  //出纳确认付款成功
  abandoned: 'abandoned',  //已废弃,
  updatedByApplicant: 'updatedByApplicant',//申请人已修改信息，待确认付款成功
}

//对申请单的操作
exports.expenseOperation = {
  create: 'create',//创建
  submit: 'submit',//提交
  financeAppro: 'financeAppro',//财务批准
  financeRefuse: 'financeRefuse',//财务拒绝
  cashierPay: 'cashierPay', // 出纳付款
  cashierPayFailed: 'cashierPayFailed',//出纳付款退回
  applicantUpdate: 'applicantUpdate', // 申请人修改订单信息
  cashierPaySucceed: 'cashierPaySucceed', // 出纳确认付款成功
  abandon: 'abandon', // 废弃
};

//当前审批状态
exports.orderStatus = {
  toSubmit: 'toSubmit',  //已创建，待提交
  toApproByManager: 'toApproByManager',  //已提交，待主管审批

  refusedByManager: 'refusedByManager',  //主管否决，待提交
  toApproByCashier: 'toApproByCashier',  //主管已批准，待出纳审核

  refusedByCashier: 'refusedByCashier',  //出纳否决，待提交

  refusedByIC: 'refusedByIC',  // Inter Company 已拒绝（境外付款）
  toApproByIC: 'toApproByIC',  // 出纳已审核，待 Inter Company 审核（境外付款）

  toApproByFinance: 'toApproByFinance',  //出纳 / Inter Company 已审核，待财务审核

  refusedByFinance: 'refusedByFinance',  //财务经理否决，待提交
  toApproByChief: 'toApproByChief',  //财务经理已审核，待财务总监审批

  refusedByChief: 'refusedByChief',  //财务总监否决，待提交
  toPayByCashier: 'toPayByCashier',  //财务总监已审批，待出纳付款 (旧：出纳已导出，待出纳付款)

  toConfirmSucceed: 'toConfirmSucceed', // 出纳付款，待确认付款成功

  paySucceed: 'paySucceed',  //出纳付款成功
  payFailed: 'payFailed',  //出纳付款失败，待出纳导出（申请人修改信息）

  updatedByApplicant: 'updatedByApplicant', //申请人已修改信息，待确认付款成功

  abandoned: 'abandoned',  //已废弃


  // 已废弃
  toExportByCashier: 'toExportByCashier',  //(废弃：财务总监已审批，待出纳导出)
};


//对申请单的操作
exports.orderOperation = {
  create: 'create',//创建
  submit: 'submit',//提交
  backout: 'backout',//撤回
  managerAppro: 'managerAppro',//主管批准
  managerRefuse: 'managerRefuse',//主管拒绝

  cashierAppro: 'cashierAppro', // 出纳批准
  cashierRefuse: 'cashierRefuse',//出纳拒绝

  cashierApproToIC: 'cashierApproToIC', // 出纳批准至 IC
  icAppro: 'icAppro', // Inter Company 批准
  icRefuse: 'icRefuse', // Inter Company 拒绝

  financeAppro: 'financeAppro',//财务批准
  financeRefuse: 'financeRefuse',//财务拒绝

  chiefAppro: 'chiefAppro',//总监批准
  chiefRefuse: 'chiefRefuse',//总监拒绝

  cashierPay: 'cashierPay', // 出纳付款
  cashierPayFailed: 'cashierPayFailed', // 出纳付款失败

  applicantUpdate: 'applicantUpdate', // 申请人修改订单信息
  cashierPaySucceed: 'cashierPaySucceed', // 出纳付款成功

  abandon: 'abandon', // 废弃


  // 已废弃
  cashierExport: 'cashierExport', // 出纳导出
  cashierExportAgain: 'cashierExportAgain', // 出纳再次导出
};

// voucher 的状态
exports.voucherStatus = {
  created: 'created', // 已创建
  confirmed: 'confirmed', // 已确认
}

// voucher 的操作
exports.voucherOperation = {
  create: 'create', // 创建
  confirm: 'confirm', // 确认
}

