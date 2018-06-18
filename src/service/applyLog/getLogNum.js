const
  {modelPath, componentPath, cfg, flowCfg} = require('config'),
  {applyStatus, roles, n} = cfg,
  {toApproByCashier, paySucceed} = flowCfg.orderStatus,
  {
    cashierAppro, icAppro, financeAppro,
    chiefAppro, cashierPay, submit
  } = flowCfg.orderOperation,
  {models, sequelize} = require(modelPath),
  fn = require(`${componentPath}/fn`)

/**
 * 获取用户的通知数
 * 1. 根据账户，获取 我的清单、主管审批 相关的通知
 * 2. 根据用户角色，获取相关的通知
 */

module.exports = async (args, t) => {

  let roleArr = await fn.getRoles(args.id);
  return {
    ...(await aboutAccount(args.id, t)),
    ...(await getPrint(args.id, t)),
    ...(await aboutRole(roleArr, t)),
    ...(await getBankStatements(roleArr, t)),
    ...(await getVoucherNum(roleArr, t)),
  }
}

/**
 * 账户相关的通知
 *
 * 我的清单
 *   1. 等待提交
 *      1. toHandleUsr = accountId
 *      2. applyStatus = toHandle
 *
 * 主管审批
 *   1. 等待提交
 *      1. toHandleUsr = accountId
 *      2. applyStatus = toHandle
 *
 *
 * return
 *  - order 我的清单-等待提交
 *  - managerAppro 主管审批
 */

async function aboutAccount (accountId, t) {
  let $applylogs = await models.applylog.findAll({
    transaction: t,
    attributes: [
      [sequelize.fn('count', sequelize.col('id')), 'num'],
      'toHandleRole'
    ],
    where: {
      toHandleUsr: accountId,
      applyStatus: applyStatus.toHandle
    },
    group: 'toHandleRole'
  })

  let logNum = {
    order: 0,
    managerAppro: 0
  }

  $applylogs.forEach($applylog => {
    switch ($applylog.toHandleRole) {
      case roles.applicant:
        logNum.order = $applylog.dataValues.num
        break
      case roles.manager:
        logNum.managerAppro = $applylog.dataValues.num
        break
    }
  })

  return logNum
}

/**
 * 获取需要打印的 logNum
 * return
 *  - approvingOrder
 */

async function getPrint(accountId, t) {
  let logNum = {
    approvingOrder: 0
  }

  logNum.approvingOrder = await models.order.count({
    transaction: t,
    attributes: [
      'approStatus'
    ],
    where: {
      printStatus: n,
      approStatus: toApproByCashier,
      createdUsr: accountId
    }
  })

  return logNum
}

/**
 * 根据用户角色获取 logNum
 * 1. 根据 applyLog 获取对应 logNum
 *      1. toHandleRole = accountId
 *      2. applyStatus = toHandle
 */

//todo 根据 order 的类别，需要进行区分

async function aboutRole (roleArr, t) {
  let $applylogs = await models.applylog.findAll({
    transaction: t,
    where: {
      applyStatus: applyStatus.toHandle,
      toHandleRole: {$in: roleArr},
      toHandleUsr: null
    }
  })

  let logNum = {
    cashierAppro: 0,
    icAppro: 0,
    financeAppro: 0,
    chiefAppro: 0,
    cashierPay: 0,
  }

  let logType = {
    managerAppro: 'cashierAppro',
    cashierApproToIC: 'icAppro',
    cashierAppro: 'financeAppro',
    icAppro: 'financeAppro',
    financeAppro: 'chiefAppro',
    chiefAppro: 'cashierPay',
    cashierPay: 'cashierPay',
    applicantUpdate: 'cashierPay'
  }

  for (let $applylog of $applylogs) {

    if ($applylog.operation === submit && $applylog.toHandleRole === roles.finance) {
      logNum.financeAppro++
      continue
    }

    if ($applylog.operation === financeAppro && $applylog.toHandleRole === roles.cashier) {
      logNum.cashierPay++
      continue
    }

    logNum[logType[$applylog.operation]]++
  }
  return logNum
}


/**
 * 增加银行流水的待处理数据
 *
 */
async function getBankStatements (roleArr, t) {
  let logNum = {
    bankNum: 0
  }

  if (!roleArr.includes(roles.cashier)) return logNum

  logNum.bankNum = await models.bankStatement.count({
    where: {
      voucherId: {$eq: null},
      $or: [
        {
          money: {$ne: 0},
          bankCharge: {$ne: 0}
        },
        {
          money: {$ne: 0},
          bankCharge: {$eq: 0}
        },
        {
          money: {$eq: 0},
          bankCharge: {$ne: 0}
        },
      ]
    },
    transaction: t
  })

  return logNum
}

/**
 * 增加 voucher 的待处理数据
 *
 */
async function getVoucherNum (roleArr, t) {
  let logNum = {
    voucherPNum: 0,
    voucherRNum: 0,
  }

  if (!roleArr.includes(roles.GL) && !roleArr.includes(roles.InterCompany)) return logNum

  let nums = await models.voucher.count({
    where: {
      flowStatus: flowCfg.voucherStatus.created
    },
    attributes: ['transactionType'],
    transaction: t,
    group: 'transactionType'
  })

  nums.forEach(num => {
    switch (num.transactionType) {
      case 'Payment':
        logNum.voucherPNum = num.count
        break
      case 'Receipt':
        logNum.voucherRNum = num.count
        break
    }
  })

  return logNum
}
