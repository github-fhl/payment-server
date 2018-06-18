const
  {cfg} = require('config'),
  {transactionType} = cfg

/**
 * 获取 $statements 的类别
 * 1. 有一个的 type 为空，那么类型为凭空创建 'noSource'
 *    1. 所有流水的 type 都应该为空
 * 2. 如果既有 payment，又有 receipt，那就是内部转账 'inner'
 * 3. 其余就是 'common'
 *
 * return
 *    'noSource' / 'inner' / 'common'
 */
function getStatementType ($statements) {
  let
    paymentFlag = false,
    receiptFlag = false
  for (let $statement of $statements) {

    if (!$statement.type) return 'noSource'

    if ($statement.transactionType === transactionType.Payment) paymentFlag = true
    if ($statement.transactionType === transactionType.Receipt) receiptFlag = true
  }

  if (paymentFlag && receiptFlag) return 'inner'

  return 'common'
}
module.exports = getStatementType
