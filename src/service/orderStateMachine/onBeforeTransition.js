const
  {cfg, modelPath} = require('config'),
  {models} = require(modelPath),
  {handled} = cfg.applyStatus,
  getApplyLog = require('./getApplyLog')

/**
 * 1. init 操作跳过本函数
 * 2. 变更 order 的状态
 * 3. 将旧的 applylog 变更为 handled
 * 4. 创建新的 applyLog
 */

async function onBeforeTransition (action) {

  if (action.transition === 'goto') return

  // await this.$order.update({approStatus: action.to}, {transaction: this.t})

   if (this.$order.orderType === cfg.orderType.Expense) throw new Error(`${this.$order.orderType} 无法调用 Payment 审批流程接口`)

  await models.order.update({approStatus: action.to}, {
    transaction: this.t,
    where: {id: this.$order.id}
  })

  await models.applylog.update({applyStatus: handled}, {
    transaction: this.t,
    where: {orderId: this.$order.id}
  })

  let applylog = getApplyLog(this.$order, action.transition, this.user, this.args.remark)

  await this.$order.createApplylog(applylog, {transaction: this.t})
}
module.exports = onBeforeTransition
