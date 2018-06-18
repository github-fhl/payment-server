const
  {modelPath, cfg, helperPath} = require('config'),
  {orderType} = cfg,
  {models, sequelize} = require(modelPath),
  moment = require('moment')

/**
 * 出纳审批通过
 * 1. order 的类别只能是 Payment
 */

async function onCashierApproToIC () {
  if (this.$order.orderType !== orderType.OverseasPayment) throw new Error(`${this.$order.orderType} 类别的申请单，不能执行该操作`)
}
module.exports = onCashierApproToIC
