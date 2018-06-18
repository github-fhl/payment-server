const
  {modelPath, cfg, helperPath, tempPath, downloaddir} = require('config'),
  NP = require('number-precision'),
  {subjectType, y} = cfg,
  {mkdirRecursion} = require(helperPath).common,
  {models} = require(modelPath),
  {ExpenseMachine} = require('../expenseStateMachine'),
  moment = require('moment'),
  vendor = require('../vendor'),
  path = require('path'),
  {v1} = require('uuid'),
  Excel = require('exceljs')

/**
 * 导出银行 Excel
 * 1. 更新所有 order 的导出状态
 * 2. 获取所有的 orderId 对应的 detail 数据
 *    1. 移除所有金额为 0 的 detail
 *    2. 移除 cash 类别的 detail
 * 3. 将 detail 数据根据人员、账户进行合并
 * 4. 导出 Excel
 */

module.exports = async (orderIds, t) => {
  await models.order.update({
    exportStatus: y
  }, {
    transaction: t,
    where: {
      id: {$in: orderIds}
    }
  })

  let bankInfoDetails = []

  for (let orderId of orderIds) {
    bankInfoDetails = [...bankInfoDetails, ...(await getBankInfo(orderId, t))]
  }
  bankInfoDetails = combineBankInfo(bankInfoDetails)

  return await createExcel(bankInfoDetails, t)
}

async function getBankInfo(orderId, t) {
  let $order = await models.order.findByPrimary(orderId, {
    transaction: t,
    include: [{
      model: models.subject,
    }, {
      model: models.orderdetail,
      where: {status: 1},
      required: false,
      include: [{
        model: models.company
      }, {
        model: models.vendor
      }]
    }]
  });

  if (!$order.subject) throw new Error(`该 order ${$order.id}没有对应的付款银行`);

  let
    TransactionType = ['LTR', 1],
    BeneficiaryCode = ['CN', 2],
    DebitAccountNumber = [$order.subject.bankNum, 3],

    PaymentCurrency = ['CNY', 5],
    ValueDate = [moment($order.paidDate).format('MM/DD/YYYY'), 9],
    Charges = ['OUR', 10],
    BeneficiaryBankAddressLine1 = ['支行', 15],
    CompanyAddress = ['Shanghai,China', 52];

  let bankInfoDetails = []

  if ($order.subject.bankCode !== 'CA') {
    $order.orderdetails.forEach($orderdetail => {

      console.log('$orderdetail: ', $orderdetail.money)

      if ($orderdetail.money !== 0) {
        bankInfoDetails.push({
          TransactionType,
          BeneficiaryCode,
          DebitAccountNumber,
          PayerName: [$orderdetail.company.name, 4],
          PaymentCurrency,
          TransactionAmount: [$orderdetail.money, 6],
          ValueDate,
          Charges,
          BeneficiaryBankName: [$orderdetail.bankName, 14],
          BeneficiaryBankAddressLine1,
          BeneficiaryName: [$orderdetail.vendor.name, 18],
          BeneficiaryAccountNumber: [$orderdetail.bankNum, 22],
          PaymentDetails1: [$orderdetail.remark, 23],
          CompanyAddress
        })
      }
    })
  }

  console.log('bankInfoDetails: ', bankInfoDetails)

  return bankInfoDetails
}


/**
 * 合并银行信息
 */

function combineBankInfo (bankInfoDetails) {
  let bankInfoDetailObjs = {}

  bankInfoDetails.forEach(detail => {
    let
      name = detail.BeneficiaryName[0],
      num = detail.BeneficiaryAccountNumber[0]
    if (!bankInfoDetailObjs[`${name}-${num}`]) {
      bankInfoDetailObjs[`${name}-${num}`] = detail
    }
    else {
      bankInfoDetailObjs[`${name}-${num}`].TransactionAmount[0] =
        NP.plus(
          bankInfoDetailObjs[`${name}-${num}`].TransactionAmount[0],
          detail.TransactionAmount[0]
        )
    }
  })

  return Object.values(bankInfoDetailObjs)
}


async function createExcel (bankInfoDetails, t) {
  console.log('bankInfoDetails: ', bankInfoDetails)
  let workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(path.join(tempPath, 'exportBankInfo.xlsx'))

  let worksheet = workbook.getWorksheet(1);

  // 写入数据
  bankInfoDetails.forEach(detail => {
    worksheet.addRow();
    let newRow = worksheet.lastRow;

    Object.values(detail).forEach(item => {
      console.log('item: ', item)
      newRow.getCell(item[1]).value = item[0];
    })
  })

  let dir = path.join(downloaddir, `${moment().format('YYYYMMDD')}/bankInfo`)
  mkdirRecursion(dir);
  let filePath = path.join(dir, `${v1()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return {path: `${filePath.split(`public${path.sep}`)[1]}`}
}
