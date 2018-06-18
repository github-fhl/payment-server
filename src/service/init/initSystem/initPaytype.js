const
  {modelPath, mainPath} = require('config'),
  {models} = require(modelPath),
  xlsx = require('node-xlsx'),
  path = require('path'),
  _ = require('lodash')

// let paytypes = [
//   {id: 'car', category: 'employee', description: '车贴'},
//   {id: 'COLA', category: 'employee', description: '补贴', subjectId: '111a73a0-06da-11e7-b23d-513f39f5849c'},
//   {id: 'paper', category: 'operatingCost', description: '纸张'},

// 员工相关
// {id: 'Salary-local payment', category: 'employee', description: '', rankNum: 1},
// {id: 'Salary-oversea payment', category: 'employee', description: '', rankNum: 2},
// {id: 'Freelancer', category: 'employee', description: '', rankNum: 3},
// {id: 'Intern', category: 'employee', description: '', rankNum: 4},
// {id: 'COLA', category: 'employee', description: '', rankNum: 5},
// {id: 'Housing', category: 'employee', description: '', rankNum: 6},
// {id: 'Car-fixed', category: 'employee', description: '', rankNum: 7},
// {id: 'Car-daily', category: 'employee', description: '', rankNum: 8},
// {id: 'Mobile-company', category: 'employee', description: '', rankNum: 9},
// {id: 'Mobile-staff', category: 'employee', description: '', rankNum: 10},
// {id: 'Medical', category: 'employee', description: '', rankNum: 11},
// {id: 'Education', category: 'employee', description: '', rankNum: 12},
// {id: 'Language', category: 'employee', description: '', rankNum: 13},
// {id: 'Recruitment', category: 'employee', description: '', rankNum: 14},
// {id: 'Relocation', category: 'employee', description: '', rankNum: 15},
// {id: 'Individual Income Tax', category: 'employee', description: '', rankNum: 16},
// {id: 'Social Insurances', category: 'employee', description: '', rankNum: 17},
// {id: 'Housing Fund', category: 'employee', description: '', rankNum: 18},
// {id: 'Others_Staff', category: 'employee', description: '', rankNum: 19},
// {id: 'Cash Advance', category: 'employee', description: '', rankNum: 20},
//
// // 增加
//
// {id: 'Visa', category: 'employee', description: '', rankNum: 21},
// {id: 'Travel', category: 'employee', description: '', rankNum: 22},
// {id: 'Credit Card', category: 'employee', description: '', rankNum: 23},
//
//
// // 运营成本
// {id: 'Staff_Welfare_Cost', category: 'operatingCost', description: '', rankNum: 24},
// {id: 'Office_Cost', category: 'operatingCost', description: '', rankNum: 25},
// {id: 'Commercial_Cost', category: 'operatingCost', description: '', rankNum: 26},
// {id: 'IT_Cost', category: 'operatingCost', description: '', rankNum: 27},
// {id: 'Financial_Cost', category: 'operatingCost', description: '', rankNum: 28},

// ];

// let paytypedetails = [
//
//   {id: 'car-1', paytypeId: 'car', description: '', rankNum: 1, subjectId: '111a73a0-06da-11e7-b23d-513f39f5849c'},
//   {id: 'car-2', paytypeId: 'car', description: '', rankNum: 2, subjectId: '801a73a0-06da-11e7-b23d-513f39f5849c'},
//   {id: 'paper-1', paytypeId: 'paper', description: '', rankNum: 3, subjectId: '111a73a0-06da-11e7-b23d-513f39f5849c'},
//   {id: 'paper-2', paytypeId: 'paper', description: '', rankNum: 4, subjectId: '801a73a0-06da-11e7-b23d-513f39f5849c'},

// Staff_Welfare_Cost 类别
// {id: 'Training', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 1},
// {id: 'Lunch & Learn', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 2},
// {id: 'Bagel/Town Hall', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 3},
// {id: '5@5', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 4},
// {id: 'Holiday Gifts', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 5},
// {id: 'Company Trip', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 6},
// {id: "X'mas Party", paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 7},
// {id: 'CNY Party', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 8},
// {id: 'Red Packet', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 9},
// {id: 'Team Building/Meals', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 10},
// {id: 'Others_Staff_Welfare_Cost', paytypeId: 'Staff_Welfare_Cost', description: '', rankNum: 11},
//
//
// // Office_Cost 类别
// {id: 'CAPEX', paytypeId: 'Office_Cost', description: '', rankNum: 1},
// {id: 'Rental', paytypeId: 'Office_Cost', description: '', rankNum: 2},
// {id: 'Management Fee', paytypeId: 'Office_Cost', description: '', rankNum: 3},
// {id: 'Parking', paytypeId: 'Office_Cost', description: '', rankNum: 4},
// {id: 'Utilities', paytypeId: 'Office_Cost', description: '', rankNum: 5},
// {id: 'Facility Management', paytypeId: 'Office_Cost', description: '', rankNum: 6},
// {id: 'Stationary', paytypeId: 'Office_Cost', description: '', rankNum: 7},
// {id: 'Office Supplies', paytypeId: 'Office_Cost', description: '', rankNum: 8},
// {id: 'Postage & Courier', paytypeId: 'Office_Cost', description: '', rankNum: 9},
// {id: 'Storage', paytypeId: 'Office_Cost', description: '', rankNum: 10},
// {id: 'Office Insurance', paytypeId: 'Office_Cost', description: '', rankNum: 11},
// {id: 'Magazines', paytypeId: 'Office_Cost', description: '', rankNum: 12},
// {id: 'Others_Office_Cost', paytypeId: 'Office_Cost', description: '', rankNum: 13},
//
// // Commercial_Cost 类别
// {id: 'Travel', paytypeId: 'Commercial_Cost', description: '', rankNum: 1},
// {id: 'Visa', paytypeId: 'Commercial_Cost', description: '', rankNum: 2},
// {id: 'Management Meeting', paytypeId: 'Commercial_Cost', description: '', rankNum: 3},
// {id: 'Client Entertainment', paytypeId: 'Commercial_Cost', description: '', rankNum: 4},
// {id: 'Client Meeting', paytypeId: 'Commercial_Cost', description: '', rankNum: 5},
// {id: 'Client Workshops', paytypeId: 'Commercial_Cost', description: '', rankNum: 6},
// {id: 'Hot House (HH)', paytypeId: 'Commercial_Cost', description: '', rankNum: 7},
// {id: 'Brand Breakthrough (BBT)', paytypeId: 'Commercial_Cost', description: '', rankNum: 8},
// {id: 'Presentation', paytypeId: 'Commercial_Cost', description: '', rankNum: 9},
// {id: 'Others_Commercial_Cost', paytypeId: 'Commercial_Cost', description: '', rankNum: 10},
//
//
// // IT_Cost 类别
// {id: 'Hardware-CAPEX', paytypeId: 'IT_Cost', description: '', rankNum: 1},
// {id: 'Hardware-expense', paytypeId: 'IT_Cost', description: '', rankNum: 2},
// {id: 'Software', paytypeId: 'IT_Cost', description: '', rankNum: 3},
// {id: 'Printer', paytypeId: 'IT_Cost', description: '', rankNum: 4},
// {id: 'Accessaries', paytypeId: 'IT_Cost', description: '', rankNum: 5},
// {id: 'Repair', paytypeId: 'IT_Cost', description: '', rankNum: 6},
// {id: 'Conference Call', paytypeId: 'IT_Cost', description: '', rankNum: 7},
// {id: 'Landline', paytypeId: 'IT_Cost', description: '', rankNum: 8},
// {id: 'Others_IT_Cost', paytypeId: 'IT_Cost', description: '', rankNum: 9},
//
//
// // Financial_Cost 类别
// {id: 'Internal Transfer', paytypeId: 'Financial_Cost', description: '', rankNum: 1},
// {id: 'Intercompany', paytypeId: 'Financial_Cost', description: '', rankNum: 2},
// {id: 'Cash Advance', paytypeId: 'Financial_Cost', description: '', rankNum: 3},
// {id: 'Petty Cash', paytypeId: 'Financial_Cost', description: '', rankNum: 4},
// {id: 'Bank Charges', paytypeId: 'Financial_Cost', description: '', rankNum: 5},
// {id: 'VAT & Surtaxes', paytypeId: 'Financial_Cost', description: '', rankNum: 6},
// {id: 'Corporate Income Tax', paytypeId: 'Financial_Cost', description: '', rankNum: 7},
// {id: 'Withholding Tax', paytypeId: 'Financial_Cost', description: '', rankNum: 8},
// {id: 'Audit', paytypeId: 'Financial_Cost', description: '', rankNum: 9},
// {id: 'Legal', paytypeId: 'Financial_Cost', description: '', rankNum: 10},
// {id: 'Tax Agent', paytypeId: 'Financial_Cost', description: '', rankNum: 11},
// {id: 'Tax Consulting', paytypeId: 'Financial_Cost', description: '', rankNum: 12},
// {id: 'Dividends', paytypeId: 'Financial_Cost', description: '', rankNum: 13},
// {id: 'Dividends Tax', paytypeId: 'Financial_Cost', description: '', rankNum: 14},
// {id: 'Others_Financial_Cost', paytypeId: 'Financial_Cost', description: '', rankNum: 15},
// ];

module.exports = async function (t) {
  let targetIndex = {
    category: 0,
    paytype: 1,
    paytypedetail: 2,
    description: 3,
    subjectId: 4
  }
  let data = (xlsx.parse(path.join(mainPath, 'public/PayType201805.xlsx')))[0].data;
  let subjects = await getSubjects(targetIndex, data, t);
  let paytypes = getPaytypes(targetIndex, subjects, data);
  let paytypedetails = getPaytypedetails(targetIndex, subjects, data);
  await models.paytype.bulkCreate(paytypes, {transaction: t});
  await models.paytypedetail.bulkCreate(paytypedetails, {transaction: t});
}

let getSubjects = async (targetIndex, data, t) => {
  let codes = [];
  data.forEach(item => {
    if (item[targetIndex.subjectId]) {
      codes.push(item[targetIndex.subjectId]);
    }
  })
  codes = _.uniq(codes);
  return await models.subject.findAll({where: {code: {$in: codes}}, transaction: t});
}

let getPaytypes = (targetIndex, subjects, data) => {
  let paytypes = [];
  data.forEach((item) => {
    if (item[targetIndex.paytype]) {
      let paytype = {
        id: item[targetIndex.paytype],
        category: item[targetIndex.category] === '员工相关' ? 'employee' : 'operatingCost',
        subjectId: getSubjectCode(subjects, item[targetIndex.subjectId]),
        description: item[targetIndex.description] ? item[targetIndex.description] : item[targetIndex.paytype]
      }

      if (item[targetIndex.paytypedetail]) {
        paytype.subjectId = null
        paytype.description = item[targetIndex.paytype]
      }

      paytypes.push(paytype)
    }
  })
  return paytypes;
}

let getPaytypedetails = (targetIndex, subjects, data) => {
  let paytypedetails = [];
  data.forEach((item, index, array) => {
    if (item[targetIndex.paytypedetail]) {
      if (!item[targetIndex.paytype]) {
        item[targetIndex.paytype] = array[index - 1][targetIndex.paytype];
      }
      paytypedetails.push({
        id: item[targetIndex.paytypedetail],
        description: item[targetIndex.description] ? item[targetIndex.description] : item[targetIndex.paytypedetail],
        paytypeId: item[targetIndex.paytype],
        subjectId: getSubjectCode(subjects, item[targetIndex.subjectId])
      })
    }
  })
  return paytypedetails;
}

let getSubjectCode = (subjects, code) => {
  let subjectId;
  for (let subject of subjects) {
    if (subject.code === code) {
      subjectId = subject.id;
      break;
    }
  }
  if (!subjectId) {
    throw new Error(`不存在科目${code}`);
  }
  return subjectId;
}
