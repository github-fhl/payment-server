const Excel = require('exceljs');
const {publicdir} = require('config');
const path = require('path');

module.exports = async (filePath) => {
  let workbook = new Excel.Workbook();
  let worksheet = [];

  await workbook.xlsx.readFile(path.join(publicdir, filePath));

  workbook.eachSheet(sheet => {
    worksheet.push(sheet.name);
  })

  return worksheet;
}
