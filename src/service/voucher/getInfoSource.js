const
  {modelPath, cfg} = require('config'),
  {models} = require(modelPath),
  {transactionType, nullName, specialItem} = cfg,
  NP = require('number-precision')

/**
 * 获取 Voucher 的数据源
 */

async function getInfoSource(bankStatementIds, t) {
  let $statements = await models.bankStatement.findAll({
    where: {
      id: {$in: bankStatementIds}
    },
    include: [{
      model: models.order,
      as: 'order',
      required: false,
      include: [{
        model: models.orderdetail,
        include: [{
          model: models.company
        }, {
          model: models.reimuser
        }]
      }]
    }, {
      model: models.receipt,
      as: 'receipt',
      required: false,
    }],
    transaction: t
  })
  let
    formatedPaymentInfos = formatePaymentInfo($statements),
    formatedReceiptInfos = formateReceiptInfo($statements),
    {aggregatedPaymentInfos, colNames} = aggregatePaymentInfo(formatedPaymentInfos)

  return {
    formatedReceiptInfos,
    aggregatedPaymentInfos,
    colNames
  }
}

module.exports = getInfoSource


/**
 * 格式化付款信息
 * 1. 规则1：先判断 orderdetail 是否存在 jobId，存在则根据 specialItem 的规则进行归属
 * 2. 规则2：先判断付款公司与所属公司是否相同
 *    1. 相同，实行规则3
 *    2. 不同，按所属公司进行金额汇总，汇总后放入 某一个指定的科目，用备注区分
 * 3. 规则3：根据费用类型，归属到不同的科目
 * 4. 如果是没有 order/receipt 的银行流水，那么对应的数据需要自定组装
 *
 * 1. 获取对应成本中心名字
 *    1. 如果凭空创建，则名字 = nullName
 * 2. 获取对应的费用类型
 *    1. 如果凭空创建，则 paytype = nullName
 *    2. 如果付款公司与所属公司不同，则 paytype = 所属公司 name
 *    3. paytype = paytypedetailId || paytypeId
 * 3. 只有凭空创建的数据，才有描述
 *
 * return
 *  - id null 或者 orderId
 *  - name 成本中心的名字
 *  - paytype (paytypeId || paytypedetailId)
 *  - money
 *  - description
 */
function formatePaymentInfo($statements) {
  let formatedInfos = {}

  for (let $statement of $statements) {
    if ($statement.transactionType === transactionType.Receipt) continue

    let $order = $statement.order
    if (!$statement.type) {
      formatedInfos[$statement.id] = {
        name: nullName,
        paytype: nullName,
        money: $statement.money,
        description: $statement.description
      }
    }
    else {
      for (let detail of $order.orderdetails) {
        let paytype = detail.paytypedetailId || detail.paytypeId

        formatedInfos[detail.id+paytype] = {
          name: detail.reimuser.name,
          money: detail.money,
          paytype
        }

        if (detail.jobId) {
          for (let key in specialItem) {
            let value = specialItem[key]
            if (detail.jobId.startsWith(value.key)) {
              formatedInfos[detail.id+paytype].paytype = value.paytype
            }
          }
        }
        else if (detail.companyId !== $order.companyId) formatedInfos[detail.id+paytype].paytype = detail.company.name
      }
    }
  }

  return Object.values(formatedInfos)
}

/**
 * 格式化收款信息
 * 1. 获取对应的付款方
 *    1. 如果是凭空创建，则 payer = nullName
 * 2. 获取描述，statement 的描述
 * 3. 获取金额，statement 的金额
 *
 * return
 *  - payer
 *  - description
 *  - money
 */
function formateReceiptInfo($statements) {
  let formatedInfos = []

  for (let $statement of $statements) {
    if ($statement.transactionType === transactionType.Payment) continue

    let $receipt = $statement.receipt
    let formatedInfo = {
      description: $statement.description,
      money: $statement.money
    }

    if (!$statement.type) formatedInfo.payer = nullName
    else formatedInfo.payer = $receipt.payer

    formatedInfos.push(formatedInfo)
  }

  return formatedInfos
}


/**
 * 汇总付款信息
 * 1. 成本中心相同的，全部汇总到一个对象中
 *    1. 如果成本中心为 NULL，则不汇总
 * 2. 列出所有的付款类型
 *
 * return
 *  - aggregatedPaymentInfos
 *    - name
 *    - description
 *    - 所有的 paytype
 */
function aggregatePaymentInfo(formatedPaymentInfos) {
  let
    infos = {},
    colNames = ['name', 'description'],
    temp = 0

  for (let info of formatedPaymentInfos) {
    colNames.push(info.paytype)

    if (!infos[info.name]) {

      if (info.name === nullName) {
        infos[info.name + ' - ' + temp] = {
          name: info.name,
          [info.paytype]: info.money,
          description: info.description,
        }
        temp++
      }
      else {
        infos[info.name] = {
          name: info.name,
          [info.paytype]: info.money,
          description: info.description,
        }
      }
      continue
    }

    if (!infos[info.name][info.paytype]) {
      infos[info.name][info.paytype] = info.money
    }
    else {
      infos[info.name][info.paytype] = NP.plus(infos[info.name][info.paytype], info.money)
    }
  }

  return {
    aggregatedPaymentInfos: Object.values(infos),
    colNames: Array.from(new Set(colNames))
  }
}
