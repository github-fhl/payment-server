const
  {cfg} = require('config'),
  {transactionType, statementType} = cfg,
  NP = require('number-precision'),
  getStatementType = require('./getStatementType')

/**
 * 校验银行流水
 * 1. 银行流水必须没有对应的 voucher
 * 2. 银行流水必须是同一种费用类型 costType
 * 3. 银行账号的币种必须相同
 *
 * 4. 做 voucher 的银行流水分成 3 种类型
 *    1. 全部都是凭空创建的银行流水
 *    2. 是内部转账的银行流水
 *    3. 正常的银行流水
 */

function checkPreInfo ($statements) {
  if ($statements.length === 0) throw new Error('没有对应的银行流水')

  let costType = $statements[0].costType
  let currency = $statements[0].subject.currency

  for (let $statement of $statements) {
    if ($statement.voucherId) throw new Error(`${$statement.subject.name} - ${$statement.index} 银行流水已经做过 Voucher`)
    if ($statement.costType !== costType) throw new Error(`${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 的费用类型不一致`)
    if ($statement.subject.currency !== currency) throw new Error(`${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 的币种不一致`)
  }

  // 代表是内部转账
  let type = getStatementType($statements)

  switch (type) {
    case 'noSource':
      checkNoSource($statements)
      break
    case 'inner':
      checkInner($statements)
      break
    case 'common':
      checkCommon($statements)
      break
  }
}

module.exports = checkPreInfo

/**
 * 检查 noSource 的银行流水
 * 1. 所有的 type 都为空
 */
function checkNoSource ($statements) {
  for (let $statement of $statements) {

    if ($statement.type) throw new Error(`凭空创建的银行流水与有来源的银行流水，不能一起做凭证。`)
  }
}

/**
 * 校验内部转账
 * 1. 流水对应的 payment 与 receipt 必须各自只有一条
 * 2. payment 与 receipt 金额必须相同
 * 3. payment 的流水的 subject 必须相同
 * 4. receipt 的流水的 subject 必须相同
 * 5. 银行流水如果发生了拆分，对应的 payment/receipt 金额必须相同
 */
function checkInner ($statements) {
  let orderId, receiptId, paymentSubjectId, receiptSubjectId
  let
    orderMoney = 0,
    receiptMoney = 0

  for (let $statement of $statements) {
    switch ($statement.type) {
      case statementType.order:
        if (!orderId) orderId = $statement.commonId
        else {
          if (orderId !== $statement.commonId) {
            throw new Error(`内部转账，银行流水对应的付款单号需一致。${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 不一致`)
          }
        }

        if (!paymentSubjectId) paymentSubjectId = $statement.subjectId
        else {
          if (paymentSubjectId !== $statement.subjectId) {
            throw new Error(`内部转账，付款银行流水对应的银行账号需一致。${$statement.subject.name} - ${$statement.index}`)
          }
        }

        orderMoney = NP.plus(orderMoney, $statement.money)
        break
      case statementType.receipt:
        if (!receiptId) receiptId = $statement.commonId
        else {
          if (receiptId !== $statement.commonId) {
            throw new Error(`内部转账，银行流水对应的收款单号需一致。${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 不一致`)
          }
        }

        if (!receiptSubjectId) receiptSubjectId = $statement.subjectId
        else {
          if (receiptSubjectId !== $statement.subjectId) {
            throw new Error(`内部转账，收款银行流水对应的银行账号需一致。${$statement.subject.name} - ${$statement.index}`)
          }
        }

        receiptMoney = NP.plus(receiptMoney, $statement.money)
        break
      default:
        throw new Error(`内部转账，银行流水必须存在收付款单号。${$statement.subject.name} - ${$statement.index}`)
    }
  }

  if (orderMoney !== receiptMoney) throw new Error('内部转账，对应的收付款单金额必须相同')

  checkSum($statements)
}

/**
 * 检查普通的银行流水
 * 1. 那么所有的 statement 的 subjectId 都应该相同
 * 2. 检查所有的 vendorCode，做校验
 * 3. 银行流水如果发生了拆分，对应的 payment/receipt 金额必须相同
 */
function checkCommon ($statements) {

  let subjectId = $statements[0].subjectId
  $statements.forEach($statement => {
    if ($statement.subjectId !== subjectId) {
      throw new Error(`${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 的账号的不一致`)
    }
  })

  checkVendor($statements)
  checkSum($statements)
}


/**
 * 检查 vendor
 * 1. 如果 $statements 是 payment 的，那么所有的 venderType 都应该是相同的
 * 2. 如果 vendorType 是公司类型，那么对应的 orderdetail 中的所有 vendorId 都应该相同
 */
function checkVendor ($statements) {
  if ($statements[0].transactionType === transactionType.Receipt) return

  let vendorType = $statements[0].order.vendorType
  let vendorId = $statements[0].order.orderdetails[0].vendorId

  for (let $statement of $statements) {
    if ($statement.order.vendorType !== vendorType) {
      throw new Error(`${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 的供应商类别的不一致`)
    }

    if (vendorType === cfg.vendorType.company && $statement.order.orderdetails[0].vendorId !== vendorId) {
      throw new Error(`${$statement.subject.name} - ${$statement.index} 与 ${$statements[0].subject.name} - ${$statements[0].index} 的供应商不一致`)
    }
  }
}


/**
 * 检查银行流水如果发生了拆分，对应的 payment/receipt 金额必须相同
 */
function checkSum ($statements) {

  let amounts = {}

  for (let $statement of $statements) {
    if (!amounts[$statement.commonId]) {
      amounts[$statement.commonId] = {
        statementMoney: $statement.money,
        commonMoney: $statement[$statement.type].amount,
        indexes: [$statement.index],
        name: $statement.subject.name
      }
    }
    else {
      amounts[$statement.commonId].statementMoney = NP.plus(amounts[$statement.commonId].statementMoney, $statement.money)
      amounts[$statement.commonId].indexes.push($statement.index)
    }
  }

  for (let commonId in amounts) {
    let amount = amounts[commonId]
    if (amount.statementMoney !== amount.commonMoney) {
      throw new Error(`${commonId} 与对应的银行流水 ${amount.name} - ${amount.indexes.sort().join(', ')} 总金额不一致`)
    }
  }
}
