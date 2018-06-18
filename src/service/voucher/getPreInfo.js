const
  {modelPath, cfg} = require('config'),
  {models} = require(modelPath),
  getInfoSource = require('./getInfoSource'),
  getInitSubject = require('./getInitSubject'),
  moment = require('moment'),
  checkPreInfo = require('./checkPreInfo'),
  getStatementType = require('./getStatementType'),
  {transactionType, statementType} = cfg,
  NP = require('number-precision')

/**
 * 进入 voucher 时，需要获取预信息
 * 1. 校验
 * 2. 获取收付款数据源
 * 3. 获取凭证初始信息
 * 4. 获取系统初始化借贷方
 */

async function getPreInfo (args) {
  let $statements = await models.bankStatement.findAll({
    where: {
      id: {$in: args.bankStatementIds}
    },
    include: [{
      model: models.order,
      as: 'order',
      include: [{
        model: models.orderdetail
      }]
    }, {
      model: models.receipt,
      as: 'receipt'
    }, {
      model: models.subject
    }]
  })

  checkPreInfo($statements)
  let {formatedReceiptInfos, aggregatedPaymentInfos, colNames} = await getInfoSource(args.bankStatementIds)
  let voucherInfo = getVoucherInfo($statements)

  voucherInfo.voucherdetails = await getInitSubject($statements, voucherInfo, aggregatedPaymentInfos, colNames)

  return {
    formatedReceiptInfos,
    aggregatedPaymentInfos,
    colNames,
    voucher: voucherInfo,
    bankStatementIds: args.bankStatementIds
  }

}
module.exports = getPreInfo

/**
 * 获取凭证初始信息
 * 1. 有一个 statement 是 Payment，那么 transaction 就是 Payment
 * 2. 对于非 noSource 类别的
 *    1. 添加对应的 companyId
 *    2. 如果vendorType 是 company，那么增加对应的 vendorId
 *
 * return
 *  - voucherInfo
 *      - voucherDate
 *      - transactionType
 *      - costType
 */

function getVoucherInfo ($statements) {
  let statementType = getStatementType($statements)
  let voucherInfo = {
    voucherDate: moment(),
    transactionType: transactionType.Receipt,
    costType: $statements[0].costType,
    innerFlag: statementType === 'inner',
  }

  $statements.forEach($statement => {
    if ($statement.transactionType === transactionType.Payment) {
      voucherInfo.transactionType = transactionType.Payment
    }
  })

  if (statementType !== 'noSource') {
    let common = $statements[0][$statements[0].type]

    voucherInfo.companyId = common.companyId

    if (voucherInfo.transactionType === transactionType.Payment && common.vendorType === cfg.vendorType.company) {
      voucherInfo.vendorId = common.orderdetails[0].vendorId
    }
  }

  return voucherInfo
}
