const
  {helperPath, modelPath, cfg, flowCfg} = require('config'),
  {models} = require(modelPath),
  NP = require('number-precision'),
  update = require('./update'),
  {paySucceed} = flowCfg.orderStatus
/**
 * 审批完成后，出纳更新 payment
 * 1. 只能更新 orderdetail
 * 2. 总金额与原先保持一致
 * 3. 状态只能是 paySucceed
 *
 * @return {Promise.<void>}
 */

async function updateByCashier (args, orderdetails, user, t) {
  let $order = await models.order.findByPrimary(args.id, {transaction: t})

  if ($order.approStatus !== paySucceed) throw new Error(`${$order.approStatus} 无法执行本操作`)

  let sum = 0

  orderdetails.forEach(orderdetail => {
    sum = NP.plus(sum, orderdetail.money)
  })

  if ($order.amount !== sum) throw new Error('总金额必须与原先保持一致')
  return await update(args, orderdetails, user, t)
}

module.exports = updateByCashier
