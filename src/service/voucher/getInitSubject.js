const
  {modelPath, cfg} = require('config'),
  {models} = require(modelPath),
  {transactionType, diffSubjectCode, nullName, y, n, subjectType, specialItem} = cfg,
  NP = require('number-precision')

/**
 * 获取 Voucher 的数据源
 * 1. 如果是内部转账，则直接根据银行流水获取对应的 subject
 * 2. 获取银行对应的 voucherdetial
 * 3. 获取所有费用类型的汇总金额
 * 4. 获取所有公司名称
 *    1. paytype 为公司名称的，一律用 diffSubjectCode 对应的 subject
 *    2. 每一个公司创建一条科目
 * 5. 如果 paytype === nullName，代表是凭空创建，则汇总，对应 subjectId 为空
 * 6. 查找费用类别对应的科目
 */

async function getInitSubject ($statements, voucherInfo, aggregatedPaymentInfos, colNames) {
  if (voucherInfo.innerFlag) return getVoucherdetailByInner($statements)

  let voucherdetails = []

  voucherdetails.push(getBankVoucherdetail($statements, voucherInfo))

  if (voucherInfo.transactionType === transactionType.Payment) {
    let paytypeSums = sumPaymentInfo(aggregatedPaymentInfos, colNames)
    voucherdetails = [
      ...voucherdetails,
      ...await getNonBankVoucherdetail(paytypeSums)
    ]
  }

  return voucherdetails
}
module.exports = getInitSubject

/**
 * 如果是内部转账
 */
function getVoucherdetailByInner ($statements) {
  let paymentDetail = {
    bankFlag: y,
    type: subjectType.credit
  }
  let receiptDetail = {
    bankFlag: n,
    type: subjectType.debit
  }

  $statements.forEach($statement => {
    if ($statement.transactionType === transactionType.Payment) {
      paymentDetail.money = $statement.order.amount
      paymentDetail.subjectId = $statement.subjectId
    }
    else {
      receiptDetail.money = $statement.receipt.amount
      receiptDetail.subjectId = $statement.subjectId
    }
  })

  return [paymentDetail, receiptDetail]
}

/**
 * 生成银行对应的 voucherdetial
 * 1. 如果是 payment，那么查找所有的 payment 的 statement，然后汇总金额
 * 2. 如果是 receipt，那么查找所有的 receipt 的 statement，然后汇总金额
 * 3. 获取银行的 subject
 *    1. Payment => 贷方，credit
 *    2. Receipt => 借方，debit
 */
function getBankVoucherdetail ($statements, voucherInfo) {
  let bankDetail = {
    bankFlag: y,
    money: 0
  }
  if (voucherInfo.transactionType === transactionType.Payment) {
    bankDetail.type = subjectType.credit
    for (let $statement of $statements) {
      if ($statement.transactionType === transactionType.Payment) {
        bankDetail.subjectId = $statement.subjectId
        bankDetail.money = NP.plus(bankDetail.money, $statement.money)
      }
    }
  }
  else {
    bankDetail.type = subjectType.debit
    for (let $statement of $statements) {
      if ($statement.transactionType === transactionType.Receipt) {
        bankDetail.subjectId = $statement.subjectId
        bankDetail.money = NP.plus(bankDetail.money, $statement.money)
      }
    }
  }

  return bankDetail
}


/**
 * 求和 付款信息中的费用类型
 * return
 *  - paytype: money
 */
function sumPaymentInfo (aggregatedPaymentInfos, colNames) {
  let paytypeSums = {}

  for (let paytype of colNames) {
    if (['name', 'description'].includes(paytype)) continue

    for (let info of aggregatedPaymentInfos) {
      if (!paytypeSums[paytype]) paytypeSums[paytype] = info[paytype]
      else {
        if (info[paytype]) {
          paytypeSums[paytype] = NP.plus(paytypeSums[paytype], info[paytype])
        }
      }
    }
  }

  return paytypeSums
}


/**
 * 获取 费用类别对应的 voucherdetail
 * 1. 如果 paytype 是公司名字 或者是属于 specialItem ，则使用 diffSubjectCode 的 code，每个公司创建一条数据
 * 2. 如果 paytype === nullName，代表是凭空创建，则对应 subjectId 为空
 * 3. 去 paytype paytypedetail 中查找对应 subjectId
 */
async function getNonBankVoucherdetail (paytypeSums) {
  let voucherdetails = []

  let companyNames = (await models.company.findAll()).map($company=> $company.name)
  let specialPaytype = Object.values(specialItem).map(item => item.paytype)
  let $diffSubject = await models.subject.findOne({where: {code: diffSubjectCode}})

  for (let paytype in paytypeSums) {
    let money = paytypeSums[paytype]

    if (companyNames.includes(paytype) || specialPaytype.includes(paytype)) {
      voucherdetails.push({
        bankFlag: n,
        money,
        subjectId: $diffSubject.id,
        type: subjectType.debit,
        remark: paytype
      })
    }
    else if (paytype === nullName) {
      voucherdetails.push({
        bankFlag: n,
        money,
        subjectId: null,
        type: subjectType.debit,
        remark: paytype
      })
    }
    else {
      let $paytype = await models.paytype.findByPrimary(paytype)
      let $paytypedetail = await models.paytypedetail.findByPrimary(paytype)

      if (!$paytype && !$paytypedetail) throw new Error(`${paytype} 费用类型不存在`)

      let p = $paytype || $paytypedetail
      if (!p.subjectId) throw new Error(`${paytype} 缺少对应的科目`)

      voucherdetails.push({
        bankFlag: n,
        money,
        subjectId: p.subjectId,
        type: subjectType.debit,
        remark: paytype
      })
    }
  }

  return voucherdetails
}
