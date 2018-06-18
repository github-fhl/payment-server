const
  {modelPath, cfg, flowCfg} = require('config'),
  {toHandle, handling, handled} = cfg.applyStatus,
  {cashier, applicant} = cfg.roles,
  {approve, pay} = cfg.cashierType,
  {
    toSubmit, toApproByCashier, toConfirmSucceed,toPayByCashier, updatedByApplicant, payFailed, paySucceed,
    refusedByManager, refusedByCashier, refusedByIC, refusedByFinance, refusedByChief, abandoned
  } = flowCfg.orderStatus,
  {models} = require(modelPath)

/**
 * 获取 orders
 * 1. role = cashier，那么需要判断 cashierType
 *    1. cashierType = approve，对应 order 的状态为 toApproByCashier
 *    2. cashierType = pay，对应 order 的状态为 toExportByCashier,toPayByCashier
 * 2. role = applicant，对应的 applyStatus
 *    1. = handling，则查看 order 不是 paySucceed 和 toSubmit 和 payFailed
 *    2. = paySucceed，则查看 order 是 paySucceed
 */

module.exports = async (where, orderInclude, role, applyStatus, cashierType) => {
  if (role === cashier) {
    if (applyStatus === toHandle) {
      switch (cashierType) {
        case 'approve':
          where.approStatus = toApproByCashier
          break
        case 'pay':
          where.approStatus = {$in: [toPayByCashier, toConfirmSucceed, updatedByApplicant]}
          break
      }
    }

    if (applyStatus === handled && cashierType === 'pay') {
      where.approStatus = paySucceed
    }
  }

  if (role === applicant) {
    switch (applyStatus) {
      case handling:
        where.approStatus = {$notIn: [
          refusedByManager, refusedByCashier, refusedByIC, refusedByFinance, refusedByChief, payFailed,
          paySucceed, toSubmit, payFailed, abandoned
        ]}
        break
      case handled:
        where.approStatus = paySucceed
        break
    }
  }

  return await models.order.findAll({
    where,
    include: orderInclude
  })
}
