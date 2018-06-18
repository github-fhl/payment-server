const
  {OverseasPayment} = require('config').cfg.orderType,
  updateAmountCNY = require('../order/updateAmountCNY'),
  updateBankCharge = require('../order/updateBankCharge'),
  createBankStatement = require('../bankStatement/createBankStatementAfterCreatePayment')

/**
 * 确认付款完成时
 * 1. 录入银行手续费
 * 2. 海外 order 需要录入 AmountCNY
 */

async function onCashierPaySucceed() {
  await updateBankCharge(this.$order, this.args.bankCharge, this.t)
  await createBankStatement(this.$order, this.user, this.t);

  if (this.$order.orderType !== OverseasPayment) return

  if (!this.args.amountCNY && !this.args.amountCNY[this.$order.id]) throw new Error(`${this.$order.id} 缺少对应的等值 RMB 金额`)

  let data = {
    id: this.$order.id,
    amountCNY: this.args.amountCNY[this.$order.id]
  }

  await updateAmountCNY(data, this.user, this.t);
}

module.exports = onCashierPaySucceed
