const
  Excel = require('exceljs'),
  {publicdir, uploaddir, cfg, modelPath, flowCfg} = require('config'),
  {payeeType, orderType, currency, vendorType} = cfg,
  moment = require('moment'),
  path = require('path'),
  generatorId = require('./generatorId'),
  {models} = require(modelPath)

/**
 * 导入报销文件的 Excel
 * 1. 根据 sheetName 读取 sheet 文件
 * 2. 根据 paymentDate 获取相应的报销信息数据
 *
 * return
 *  - companyName
 *  - payeeType
 *  - bankNum
 *  - vendorName
 *  - bankName
 *  - formId
 *  - reimuserName
 *  - paymentBank
 *  - payDate
 *  - paymentDate
 *  - paytypeName
 *  - money
 */

module.exports = async function importExcel(filePath, sheetName, paymentDate, t) {
  let workbook = new Excel.Workbook()

  await workbook.xlsx.readFile(path.join(publicdir, filePath))

  let
    fieldIndex, expenseTypeStartIndex

  if (sheetName === 'non-chargeable expense') {
    fieldIndex = {
      bankNum: 1,
      vendorName: 2,
      bankName: 3,
      formId: 4,
      reimuserName: 5,
      paymentBank: 8,
      payDate: 9,
      paymentDate: 10,
    }
    expenseTypeStartIndex = 13
  }
  else {
    fieldIndex = {
      bankNum: 1,
      vendorName: 2,
      bankName: 3,
      formId: 4,
      reimuserName: 5,
      jobId: 8,
      paymentBank: 9,
      payDate: 10,
      paymentDate: 11,
    }
    expenseTypeStartIndex = 20
  }

  let expenseTypeIndex = {}

  let
    expenseDetails = [],
    worksheet

  workbook.eachSheet(ws => {
    if (ws.name === sheetName) worksheet = ws
  })

  if (!worksheet) throw new Error(`不存在 ${sheetName}`)

  worksheet.eachRow((row, rowNumber) => {

    if (rowNumber === 2) {
      row.eachCell((cell, colNumber) => {
        if (
          colNumber >= expenseTypeStartIndex &&
          cell.value &&
          cell.text.toLowerCase() !== 'subtotal(others)' &&
          cell.text.toLowerCase() !== 'remark'
        ) {
          expenseTypeIndex[cell.text] = colNumber
        }
      })
    }

    if (
      rowNumber > 2 &&
      row.getCell(1).value &&
      moment(row.getCell(fieldIndex.paymentDate).value).format('YYYY-MM-DD') === paymentDate
    ) {

      let expenseDetail = {
        payeeType: payeeType.reimuser,
      }

      for (let key in fieldIndex) {
        switch (key) {
          case 'payDate':
            expenseDetail[key] = moment(row.getCell(fieldIndex[key]).value).format('YYYY-MM')
            break
          case 'paymentDate':
            expenseDetail[key] = moment(row.getCell(fieldIndex[key]).value).format('YYYY-MM-DD')
            break
          case 'jobId':
            expenseDetail.remark = row.getCell(fieldIndex[key]).text
            expenseDetail[key] = row.getCell(fieldIndex[key]).text
            break
          default:
            expenseDetail[key] = row.getCell(fieldIndex[key]).text
        }
      }

      for (let key in expenseTypeIndex) {
        let money = parseFloat(row.getCell(expenseTypeIndex[key]).value)

        if (typeof money === 'number' && !Number.isNaN(money) && money > 0) {
          expenseDetails.push({
            ...expenseDetail,
            paytypeName: key,
            money: parseFloat(row.getCell(expenseTypeIndex[key]).value),
          })
        }
      }
    }
  })

  if (expenseDetails.length === 0) throw new Error('没有查询到报销信息')
  return await formatExpense(expenseDetails, t)
}


/**
 * 生成 order 主表数据，格式化 detail 数据
 *
 * - id
 * - orderType
 * - description
 * - applyDate
 * - amount
 * - currency
 * - amountCNY
 * - vendorType
 * - expenseDetails
 *    - paytypeId
 *    - paytypedetailId
 *    - money
 *    - companyId
 *    - payDate
 *    - orderId
 *    - reimuserId
 *    - vendorName
 *    - payeeType
 *    - bankNum
 *    - bankName
 *    - formId
 */

async function formatExpense(expenseDetails, t) {
  let expense = {
    expenseDetails
  }

  Object.assign(expense, {
    id: await generatorId(t),
    orderType: orderType.Expense,
    description: `${moment().format('YYYY-MM-DD HH:mm:ss')} 创建报销申请单`,
    applyDate: moment(),
    amount: 0,
    currency: currency.CNY,
    vendorType: vendorType.user,
    approStatus: flowCfg.expenseStatus.toSubmit
  })

  for (let expenseDetail of expense.expenseDetails) {
    let $paytypedetail = await models.paytypedetail.findById(expenseDetail.paytypeName, {transaction: t})
    let $paytype = await models.paytype.findById(expenseDetail.paytypeName, {transaction: t})

    if (!$paytype && !$paytypedetail) throw new Error(`没有该费用类别 - ${expenseDetail.paytypeName}`)
    if ($paytype) expenseDetail.paytypeId = $paytype.id
    if ($paytypedetail) {
      expenseDetail.paytypeId = $paytypedetail.paytypeId
      expenseDetail.paytypedetailId = $paytypedetail.id
    }

    expenseDetail.orderId = expense.id

    let $reimuser = await models.reimuser.findOne({
      transaction: t,
      where: {name: expenseDetail.reimuserName}
    })

    if (!$reimuser) throw new Error(`报销人员 - ${expenseDetail.reimuserName} 不存在`)
    expenseDetail.reimuserId = $reimuser.id
    expenseDetail.companyId = $reimuser.companyId

    expense.amount = (expense.amount + parseFloat(expenseDetail.money)).simpleFixed()
  }
  expense.amountCNY = expense.amount
  return expense
}
