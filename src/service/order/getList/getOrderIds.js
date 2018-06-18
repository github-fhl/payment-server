const
  {modelPath, cfg, flowCfg} = require('config'),
  {toHandle, handling, handled} = cfg.applyStatus,
  {applicant, manager} = cfg.roles,
  {paySucceed} = flowCfg.orderStatus,
  {cashierPayFailed} = flowCfg.orderOperation,
  {models} = require(modelPath),
  {orderInclude} = require('./getInclude')

/**
 * 获取对应的 orderIds
 * 1. role = applicant/manager 时，对应的需要 userId
 * 2. 其余的使用角色
 * 3. role = applicant && applyStatus = toHandle，此时需要剔除掉 applylog.operation = cashierPayFailed 的 log
 */

module.exports = async (role, applyStatus, user) => {
  applyStatus = applyStatus === handling ? handled : applyStatus

  let where = {
    applyStatus,
    toHandleRole: role
  }

  if ([applicant, manager].includes(role)) {
    where.toHandleUsr = user.id
  }

  let $applylogs = await models.applylog.findAll({where})
  return $applylogs.map(log => log.orderId)
}
