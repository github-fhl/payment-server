
/**
 * 编辑 order 的银行手续费
 * 1. 增加银行手续费
 * 2. 增加 bankBalance
 *
 * - bankCharge
 *    - key: orderId, value: 手续费
 */

module.exports = async ($order, bankCharge, t) => {
  if (bankCharge[$order.id] === null || bankCharge[$order.id] === undefined) throw new Error(`缺少 ${$order.id} 的银行手续费`)

  $order.bankCharge = bankCharge[$order.id]
  await $order.save({transaction: t})
}
