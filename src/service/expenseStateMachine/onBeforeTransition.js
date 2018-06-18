const
  {cfg, modelPath} = require('config'),
  {models} = require(modelPath),
  getApplyLog = require('./getApplyLog'),
  {handled} = cfg.applyStatus

/**
 * 1. init 操作跳过本函数
 * 2. 变更 expense 的状态
 * 3. 将旧的 applylog 变更为 handled
 * 4. 创建新的 applylog，其中 abandon、cashierPaySucceed 的 applylog 的 nextHandleStatus 为已操作
 * 5. 如果操作为 create、financeRefuse，则需要指定 toHandleUsr
 */

async function onBeforeTransition (action) {

  if (action.transition === 'goto') return
  // await this.$expense.update({approStatus: action.to}, {transaction: this.t})

  if (this.$expense.orderType !== cfg.orderType.Expense) throw new Error(`${this.$expense.orderType} 无法调用 Expense 审批流程接口`)

  await models.order.update({
    approStatus: action.to
  }, {
    where: {id: this.$expense.id},
    transaction: this.t
  })

  await models.applylog.update({applyStatus: handled}, {
    transaction: this.t,
    where: {orderId: this.$expense.id}
  })

  let applylog = getApplyLog(this.$expense, action.transition, this.user, this.args.remark)

  await this.$expense.createApplylog(applylog, {transaction: this.t})
}
module.exports = onBeforeTransition
