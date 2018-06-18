const
  updateBankCharge = require('../order/updateBankCharge'),
  createBankStatement = require('../bankStatement/createBankStatementAfterCreatePayment')

/**
 * 确认付款完成时
 * 1. 录入银行手续费
 */

async function onCashierPaySucceed() {
  await updateBankCharge(this.$expense, this.args.bankCharge, this.t);
  await createBankStatement(this.$expense, this.user, this.t);
}

module.exports = onCashierPaySucceed
