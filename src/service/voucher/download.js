const
  {helperPath} = require('config'),
  Excel = require('exceljs'),
  path = require('path'),
  helper = require(helperPath),
  mainPath = path.join(require.main.filename, '..'),
  moment = require('moment');

/**
 * 导出凭证excel
 * 第一步：根据付款类型加载对应的excel模板
 * 第二步：将数据填充至模板
 * @param obj
 * @returns {Promise<string>}
 */
module.exports = async obj => {

  let workbook = new Excel.Workbook();

  if (obj.transactionType === 'Payment') {
    await workbook.xlsx.readFile(`${mainPath}/public/temp/voucher.xlsx`);
  } else {
    await workbook.xlsx.readFile(`${mainPath}/public/temp/ReceiptVoucher.xlsx`);
  }

  let worksheet = workbook.getWorksheet(1);

  if (obj.logoPath) {
    let logoId = workbook.addImage({
      filename: `${mainPath}/public/${obj.logoPath}`,
      extension: obj.logoPath.substring(obj.logoPath.lastIndexOf(".") + 1)
    });

    worksheet.addImage(logoId, 'I1:I6');
  }

  if (obj.name) {
    worksheet.getCell('B7').value = worksheet.getCell('B7').value + obj.name;
  }
  worksheet.getCell('I7').value = worksheet.getCell('I7').value + obj.paidNo;
  if (obj.vendorName) {
    worksheet.getCell('B9').value = worksheet.getCell('B9').value + obj.vendorName;
  }
  worksheet.getCell('D9').value = `日期：  ${obj.year}年  ${obj.month}月  ${obj.day}日`;
  if (obj.vendorCode) {
    worksheet.getCell('B10').value = worksheet.getCell('B10').value + obj.vendorCode;
  }

  let detailLine = 14;
  let modelRow = worksheet.getRow(14);

  if (obj.details.length > 0) {
    for (let item of obj.details) {
      setDetailValueAndStyle(worksheet, modelRow, detailLine, item);
      detailLine++;
    }
    setTotalValueAndStyle(worksheet, modelRow, detailLine, obj);
  }

  let dir = `${mainPath}/public/download/${moment().format('YYYYMMDD')}`;
  helper.common.mkdirRecursion(dir);
  let filePath = `${dir}/${obj.paidNo}.xlsx`;
  await workbook.xlsx.writeFile(filePath);
  return `${filePath.split('public/')[1]}`
}

/**
 * 生成付款凭证明细行
 * @param worksheet
 * @param modelRow
 * @param detailLine
 * @param item
 */
let setDetailValueAndStyle = (worksheet, modelRow, detailLine, item) => {
  let row = worksheet.getRow(detailLine);
  row.height = 35;
  for (let i = 2; i < 6; i++) {
    row.getCell(2).style = modelRow.getCell(2).style;
  }
  if (detailLine > 14) {
    worksheet.mergeCells(`B${detailLine}:F${detailLine}`);
  }
  row.getCell(2).value = item.description;
  row.getCell(7).style = modelRow.getCell(7).style;
  row.getCell(7).value = item.subject.name;
  row.getCell(8).style = modelRow.getCell(8).style;
  row.getCell(8).value = item.subject.code;
  row.getCell(9).style = modelRow.getCell(9).style;
  row.getCell(9).value = item.money;
}

/**
 * 生成合计行
 * @param worksheet
 * @param modelRow
 * @param detailLine
 * @param obj
 */
let setTotalValueAndStyle = (worksheet, modelRow, detailLine, obj) => {
  let row = worksheet.getRow(detailLine);
  for (let i = 2; i < 9; i++) {
    row.getCell(i).style = modelRow.getCell(i).style;
  }
  worksheet.mergeCells(`B${detailLine}:H${detailLine}`);
  row.getCell(2).value = '合计 Total';
  row.getCell(9).value = obj.amount;
  row.getCell(9).style = modelRow.getCell(9).style;
}