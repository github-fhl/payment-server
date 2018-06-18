const Excel = require('exceljs');
const {publicdir} = require('config');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const mainPath = path.join(require.main.filename, '..');

/**
 * 解析申请单excel
 * 第一步：根据传入的type判断是通过邮件获取的excel还是通过页面导入按钮导入的excel
 * 第二步：解析excel并返回解析后的参数
 * @param filePath
 * @param type
 * @returns {Promise<*>}
 */
module.exports = async (filePath, type) => {
  if (type === '公司' || type === '个人') {
    return await getWorksheetByCompanyOrPersonal(filePath, type);
  } else {
    return await getWorksheetFromMail(filePath)
  }
}

/**
 * 解析页面导入的申请单
 * @param filePath
 * @param type
 * @returns {Promise<{order, details: Array, type: string}>}
 */
async function getWorksheetByCompanyOrPersonal(filePath, type) {
  let workbook = new Excel.Workbook();
  let worksheet;

  await workbook.xlsx.readFile(path.join(publicdir, filePath));

  workbook.eachSheet(sheet => {
    if (sheet.name === type) {
      worksheet = sheet;
    }
  })
  if (!worksheet) {
    throw new Error('传入的表格名为公司或个人');
  }
  if (type === '公司') {
    return parseCompanyExcel(worksheet);
  }
  return parsePersonalExcel(worksheet);
}

/**
 * 解析通过邮件获取的申请单
 * @param filePath
 * @returns {Promise<{order, details, type}>}
 */
async function getWorksheetFromMail(filePath) {
  let orderType;
  let worksheetCompany, worksheetUser;
  let downloadPath = path.join(mainPath, 'public/fromMail', moment().format('YYYYMMDD'));
  let workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(path.join(downloadPath, filePath));
  workbook.eachSheet(sheet => {
    if (sheet.name === '公司') {
      worksheetCompany = sheet;
    } else if (sheet.name === '个人') {
      worksheetUser = sheet;
    }
  })
  if (!worksheetCompany && !worksheetUser) {
    throw new Error('表名必须为公司或个人');
  }
  worksheetCompany.eachRow((row, rowNumber) => {
    if (rowNumber == 3 && row.getCell(2).value) {
      orderType = '公司';
    }
  })
  if (!orderType) {
    worksheetUser.eachRow((row, rowNumber) => {
      if (rowNumber == 3 && !row.getCell(2).value) {
        throw new Error('必须传入一张表公司或个人')
      } else {
        orderType = '个人';
      }
    })
  }
  if (orderType === '公司') {
    return parseCompanyExcel(worksheetCompany);
  } else {
    return parsePersonalExcel(worksheetUser);
  }
}

/**
 * 解析类型为公司的申请单
 * @param worksheet
 * @returns {{order, details: Array, type: string}}
 */
function parseCompanyExcel(worksheet) {
  let order = {};
  let detailArray = [];
  let orderIndex = {
    description: 2,
    currency: 3,
    company: 4,
    amount: 5,
    amountCNY: 6,
    vendorName: 7,
    bankNum: 8,
    bankName: 9,
    contacter: 10,
    telphone: 11,
    vendorAddress: 12,
    bankAddress: 13,
    bankCodeType: 14,
    bankCode: 15,
    country: 16
  };
  let detailIndex = {
    company: 2,
    paytypeId: 3,
    paytypedetailId: 4,
    costCenter: 5,
    payDate: 6,
    money: 7,
    remark: 8
  };
  let orderMust = ['description', 'currency', 'company', 'amount', 'payee', 'bankNum', 'bankName'];
  let detailMust = ['company', 'paytype', 'costCenter', 'month', 'money'];
  worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
    if (rowNumber == 3) {
      for (let key in orderIndex) {
        if (_.indexOf(orderMust, key) >= 0) {
          if (row.getCell(orderIndex[key]).value) {
            if (key === 'amount') {
              order[key] = row.getCell(orderIndex[key]).value;
            } else {
              order[key] = row.getCell(orderIndex[key]).value.toString();
            }
          } else {
            throw new Error(`${key}为必填项`)
          }
        } else {
          order[key] = row.getCell(orderIndex[key]).value ? row.getCell(orderIndex[key]).value.toString() : row.getCell(orderIndex[key]).value;
        }
      }
    }
    if (rowNumber >= 6 && row.getCell(2).value && (row.getCell(2).value !== undefined)) {
      let detail = {};
      for (let key in detailIndex) {
        if (_.indexOf(detailMust, key) >= 0) {
          if (row.getCell(detailIndex[key]).value) {
            if (key === 'money') {
              detail[key] = row.getCell(detailIndex[key]).value;
            } else {
              detail[key] = row.getCell(detailIndex[key]).value.toString();
            }
          } else {
            throw new Error(`${key}为必填项`);
          }
        } else {
          detail[key] = row.getCell(detailIndex[key]).value ? row.getCell(detailIndex[key]).value.toString() : row.getCell(detailIndex[key]).value;
        }
      }
      detailArray.push(detail);
    }
  })
  return {order: order, details: detailArray, type: '公司'};
}

/**
 * 解析类型为个人的申请单
 * @param worksheet
 * @returns {{order, details: Array, type: string}}
 */
function parsePersonalExcel(worksheet) {
  let order = {};
  let detailArray = [];
  let orderIndex = {
    description: 2,
    currency: 3,
    company: 4,
    amount: 5,
    amountCNY: 6
  };
  let detailIndex = {
    company: 2,
    paytypeId: 3,
    paytypedetailId: 4,
    costCenter: 5,
    payDate: 6,
    money: 7,
    vendorName: 8,
    bankName: 9,
    bankNum: 10,
    remark: 11,
  };
  let orderMust = ['description', 'currency', 'amount'];
  let detailMust = ['company', 'paytypeId', 'costCenter', 'payDate', 'money', 'vendorName', 'bankName', 'bankNum'];
  worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
    if (rowNumber == 3) {
      for (let key in orderIndex) {
        if (_.indexOf(orderMust, key) >= 0) {
          if (row.getCell(orderIndex[key]).value) {
            if (key === 'amount') {
              order[key] = row.getCell(orderIndex[key]).value;
            } else {
              order[key] = row.getCell(orderIndex[key]).value.toString();
            }
          } else {
            throw new Error(`${key}为必填项`);
          }
        } else {
          order[key] = row.getCell(orderIndex[key]).value ? row.getCell(orderIndex[key]).value.toString() : row.getCell(orderIndex[key]).value;
        }
      }
    }
    if (rowNumber >= 6 && row.getCell(2).value && (row.getCell(2).value != undefined)) {
      let detail = {};
      for (let key in detailIndex) {
        if (_.indexOf(detailMust, key) >= 0) {
          if (row.getCell(detailIndex[key]).value) {
            if (key === 'money') {
              detail[key] = row.getCell(detailIndex[key]).value;
            } else {
              detail[key] = row.getCell(detailIndex[key]).value.toString();
            }
          } else {
            throw new Error(`${key}为必填项`);
          }
        } else {
          detail[key] = row.getCell(detailIndex[key]).value ? row.getCell(detailIndex[key]).value.toString() : row.getCell(detailIndex[key]).value;
        }
      }
      detailArray.push(detail);
    }
  })
  return {order: order, details: detailArray, type: '个人'};
}
