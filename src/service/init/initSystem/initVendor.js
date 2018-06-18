const
  {modelPath, mainPath} = require('config'),
  {models} = require(modelPath),
  path = require('path'),
  Excel = require('exceljs'),
  uuidv1 = require('uuid/v1')

let vendors = [
  {
    id: '248a4c90-06da-11e7-b23d-513f39f5849c',
    name: '上海出租车',
    contacter: '强哥',
    telphone: '021-31313445',
    vendorType: 'company',
    code: 'code1',
    status: 1
  },
  {
    id: '248a73a0-06da-11e7-b23d-513f39f5849c',
    name: '上海餐饮',
    contacter: '华哥',
    telphone: '021-31313445',
    vendorType: 'company',
    code: 'code2',
    status: 1
  },
  {
    id: '123a73a0-06da-11e7-b23d-513f39f5849c',
    name: '个人供应商1',
    contacter: '个1',
    telphone: '021-31213345',
    vendorType: 'user',
    code: 'code3',
    status: 1
  },
]
let vendorDetails = [
  {id: '69b6a690-0eca-11e7-8881-5f624753c8ec', bankNum: '111111111111111111', bankName: '上海银行'},
  {id: '69b769e0-0eca-11e7-8881-5f624753c8ec', bankNum: '222222222222222222', bankName: '中国银行'},
  {id: '789769e0-0eca-11e7-8881-5f624753c8ec', bankNum: '333333333333333333', bankName: '工商银行'},
]

/**
 * 导入vendor，vendordetail
 * 第一步：导入写死的vendor，vendordetail给几个测试用的成本中心用
 * 第二步：导入excel中的vendor，vendordetail
 * @param t
 * @returns {Promise<void>}
 */
module.exports = async function (t) {
  let vendorObjs = await models.vendor.bulkCreate(vendors, {transaction: t});
  for (let i = 0, len = vendorObjs.length; i < len; i++) {
    vendorDetails[i].vendorId = vendorObjs[i].id;
    await models.vendordetail.create(vendorDetails[i], {transaction: t})
  }

  let targetPath = await handleSheet();

  let workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(targetPath);
  // await workbook.xlsx.readFile(path.join(mainPath, 'public/Vendor201805.xlsx'));

  let worksheet1 = workbook.getWorksheet(1);
  let worksheet2 = workbook.getWorksheet(2);

  await createVendorFromExcel(worksheet1, t);
  await createVendorDetailFromExcel(worksheet2, t);
}

/**
 *导入excel模板中的vendor
 * 需要校验vendor的名称是否为一
 * @param worksheet1
 * @param t
 * @returns {Promise<void>}
 */
let createVendorFromExcel = async (worksheet1, t) => {
  let vendorList = {};
  let vendorName;

  worksheet1.eachRow(function (row, rowNumber) {
    if (rowNumber !== 1 && row.values[1] && row.values[2]) {
      vendorName = row.values[2];
      if (vendorList[row.values[2].toLowerCase()]) {
        vendorName = vendorName + ` - ${row.values[1]}`;
      }

      vendorList[row.values[2].toLowerCase()] = {
        id: uuidv1(),
        name: vendorName,
        code: row.values[1]
      }
    }
  });

  await models.vendor.bulkCreate(Object.values(vendorList), {transaction: t})
}

/**
 * 导入excel模板中的vendordetail
 * 第一步：解析所有的vendordetail
 * 第二步：调取checkVendor方法检查每个vendordetail是否都有对应的vendor
 * 第三步：创建vendordetail
 * @param worksheet2
 * @param t
 * @returns {Promise<void>}
 */
let createVendorDetailFromExcel = async (worksheet2, t) => {
  let vendorDetails = [];
  let bankName = [];
  worksheet2.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
      if (!bankName.includes(row.values[2])) {
        bankName.push(row.values[2]);
        vendorDetails.push({vendorName: row.values[1], bankName: row.values[2], bankNum: row.values[3]});
      }
    }
  })
  let vendorDetailsObj = await checkVendor(vendorDetails, t);
  await models.vendordetail.bulkCreate(vendorDetailsObj, {transaction: t});
}

/**
 * 检查每个vendordetail是否都有对应的vendor如果没有则创建一条vendor
 * @param vendorDetails
 * @param t
 * @returns {Promise<Array>}
 */
let checkVendor = async (vendorDetails, t) => {
  let resultArray = [];
  for (let item of vendorDetails) {
    let vendor = await models.vendor.findOne({where: {name: item.vendorName}, transaction: t});
    if (!vendor) {
      vendor = await models.vendor.create({code: 'A000', name: item.vendorName}, {transaction: t});
    }
    resultArray.push({vendorId: vendor.id, bankNum: item.bankNum, bankName: item.bankName});

  }
  return resultArray;
}

/**
 *工具方法，用于将vendor表中的vendordetail竖表转换为横表
 *源表格两条不同记录之间必须有空行
 * @returns {Promise<void>}
 */
let handleSheet = async () => {

  let workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(path.join(mainPath, 'public/Vendor201805.xlsx'));

  let worksheet = workbook.getWorksheet(2);

  workbook.removeWorksheet(2);

  let targetWorksheet = workbook.addWorksheet('sheet1');

  let i = 1;
  let rowValues = [];

  worksheet.eachRow((row, rowNumber) => {
    if (row.values[1]) {
      rowValues[i] = row.values[1];
      i++;
      if (!worksheet.getRow(rowNumber + 1).values[1]) {
        targetWorksheet.addRow(rowValues);
        rowValues = [];
        i = 1;
      }
    }
  })

  let targetPath = path.join(mainPath, 'public/targetVendor201805.xlsx');
  await workbook.xlsx.writeFile(path.join(mainPath, 'public/targetVendor201805.xlsx'));
  return targetPath;
}