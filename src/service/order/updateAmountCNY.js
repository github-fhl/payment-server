const
  {modelPath, flowCfg, cfg} = require('config'),
  {models} = require(modelPath),
  {orderType} = cfg,
  {toConfirmSucceed, updatedByApplicant, paySucceed} = flowCfg.orderStatus,
  NP = require('number-precision')

/**
 * 更新非 RMB 的等值 RMB 金额
 *
 * data
 *  - id
 *  - amountCNY
 *
 */

module.exports = async (data, user, t) => {
  let $order = await models.order.findByPrimary(data.id, {
    transaction: t
  })

  if (!data.amountCNY) throw new Error(`缺少 ${data.id} 的等值 RMB 金额`)
  if (![toConfirmSucceed, updatedByApplicant, paySucceed].includes($order.approStatus)) throw new Error(`${$order.approStatus} 状态不能更新等值 RMB 金额`)
  if ($order.orderType !== orderType.OverseasPayment) throw new Error(`该申请单是 ${$order.orderType}，无法录入等值 RMB 金额`)

  let excRate = NP.divide(data.amountCNY, $order.amount)

  await $order.update({amountCNY: data.amountCNY, excRate}, {transaction: t})
}
