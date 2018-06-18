// const
//     Excel = require('exceljs'),
//     {uploaddir, cfg, modelPath, flowCfg} = require('config'),
//     {payeeType, orderType, currency, vendorType} = cfg,
//     moment = require('moment'),
//     path = require('path'),
//     generatorId = require('./generatorId'),
//     {models} = require(modelPath)
//
// /**
//  * 导入 付款申请单的 Excel
//  * 1. 根据 sheetName 读取 sheet 文件
//  * 2. 根据 paymentDate 获取相应的报销信息数据
//  *
//  * return
//  *  - companyName
//  *  - payeeType
//  *  - bankNum
//  *  - vendorName
//  *  - bankName
//  *  - formId
//  *  - reimuserName
//  *  - paymentBank
//  *  - payDate
//  *  - paymentDate
//  *  - paytypeName
//  *  - money
//  */
//
// module.exports = async function importExcel(filePath, sheetName, paymentDate, t) {
//     let workbook = new Excel.Workbook()
//
//     await workbook.xlsx.readFile(path.join(uploaddir, filePath))
//
//     const
//         fieldIndex = {
//             bankNum: 1,
//             vendorName: 2,
//             bankName: 3,
//             formId: 4,
//             reimuserName: 5,
//             paymentBank: 8,
//             payDate: 9,
//             paymentDate: 11,
//         },
//         expenseTypeStartIndex = 17,
//         companyName = 'GTB AP CENTRAL'
//     let expenseTypeIndex = {}
//
//     let expenses = [],
//         worksheet
//
//     workbook.eachSheet(ws => {
//         if (ws.name === sheetName) worksheet = ws
//     })
//
//     worksheet.eachRow((row, rowNumber) => {
//
//         if (rowNumber === 2) {
//             row.eachCell((cell, colNumber) => {
//                 if (colNumber >= expenseTypeStartIndex && cell.value) {
//                     expenseTypeIndex[cell.text] = colNumber
//                 }
//             })
//         }
//
//         if (
//             rowNumber > 2 &&
//             row.getCell(1).value &&
//             moment(row.getCell(fieldIndex.paymentDate).value).format('YYYY-MM-DD') === paymentDate
//         ) {
//             let expense = {
//                 expenseDetails: []
//             }
//
//             let expenseDetail = {
//                 companyName,
//                 payeeType: payeeType.reimuser,
//             }
//
//             for (let key in fieldIndex) {
//                 if (key === 'payDate') expenseDetail[key] = moment(row.getCell(fieldIndex[key]).value).format('YYYY-MM')
//                 else if (key === 'paymentDate') expenseDetail[key] = moment(row.getCell(fieldIndex[key]).value).format('YYYY-MM-DD')
//                 else expenseDetail[key] = row.getCell(fieldIndex[key]).text
//             }
//
//             for (let key in expenseTypeIndex) {
//                 expense.expenseDetails.push({
//                     ...expenseDetail,
//                     paytypeName: key,
//                     money: parseFloat(row.getCell(expenseTypeIndex[key]).value),
//                 })
//             }
//
//             expenses.push(expense)
//         }
//     })
//
//     if (expenses.length === 0) throw new Error('没有查询到报销信息')
//     return await formatExpense(expenses, t)
// }
//
// /**
//  * 生成 order 主表数据，格式化 detail 数据
//  *
//  * - id
//  * - orderType
//  * - description
//  * - applyDate
//  * - companyId
//  * - amount
//  * - currency
//  * - amountCNY
//  * - vendorType
//  * - expenseDetails
//  *    - paytypeId
//  *    - paytypedetailId
//  *    - money
//  *    - companyId
//  *    - payDate
//  *    - orderId
//  *    - reimuserId
//  *    - vendorName
//  *    - payeeType
//  *    - bankNum
//  *    - bankName
//  *    - formId
//  */
//
// async function formatExpense(expenses, t) {
//     for (let expense of expenses) {
//
//         Object.assign(expense, {
//             id: await generatorId(t),
//             orderType: orderType.Expense,
//             description: `${moment().format('YYYY-MM-DD HH:mm:ss')} 创建报销申请单`,
//             applyDate: moment(),
//             amount: 0,
//             currency: currency.CNY,
//             vendorType: vendorType.user,
//             approStatus: flowCfg.expenseStatus.toSubmit
//         })
//
//         let $company = await models.company.findOne({
//             where: {
//                 name: expense.expenseDetails[0].companyName
//             },
//             transaction: t
//         })
//
//         if (!$company) throw new Error(`${expense.expenseDetails[0].companyName} 不存在`)
//         expense.companyId = $company.id
//
//         for (let expenseDetail of expense.expenseDetails) {
//             let $paytypedetail = await models.paytypedetail.findById(expenseDetail.paytypeName, {transaction: t})
//             let $paytype = await models.paytype.findById(expenseDetail.paytypeName, {transaction: t})
//
//             if (!$paytype && !$paytypedetail) throw new Error(`没有该费用类别 - ${expenseDetail.paytypeName}`)
//             if ($paytype) expenseDetail.paytypeId = $paytype.id
//             if ($paytypedetail) {
//                 expenseDetail.paytypeId = $paytypedetail.paytypeId
//                 expenseDetail.paytypedetailId = $paytypedetail.id
//             }
//
//             expenseDetail.companyId = expense.companyId
//             expenseDetail.orderId = expense.id
//
//             let $reimuser = await models.reimuser.findOne({
//                 transaction: t,
//                 where: {name: expenseDetail.reimuserName}
//             })
//
//             if (!$reimuser) throw new Error(`报销人员 - ${expenseDetail.reimuserName} 不存在`)
//             expenseDetail.reimuserId = $reimuser.id
//
//             expense.amount = (expense.amount + expenseDetail.money).simpleFixed()
//         }
//         expense.amountCNY = expense.amount
//     }
//     return expenses
// }
