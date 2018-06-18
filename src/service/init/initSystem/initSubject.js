const
  {modelPath, mainPath, cfg} = require('config'),
  {y, n, diffSubjectCode} = cfg,
  {models} = require(modelPath),
  path = require('path'),
  xlsx = require('node-xlsx')

let subjects = [
  // 银行类别
  {id: '222a73a0-06da-11e7-b23d-513f39f5849c', name: 'HSBC_CNY_GTB', bankFlag: y, code: '8110-0098', bankNum: '088-560396-011', bankCode: 'HB', accountType: '11', currency: 'CNY'},
  {name: 'BOC_CNY_GTB', bankFlag: y, code: '8110-201', bankNum: '444260849044', bankCode: 'BC', accountType: '11', currency: 'CNY'},
  {name: 'BOC_USD_GTB', bankFlag: y, code: '8110-202', bankNum: '437760849017', bankCode: 'BC', accountType: '12', currency: 'USD'},
  {name: 'BOC_USD_CAPITAL_GTB', bankFlag: y, code: '8110-203', bankNum: '435160848962', bankCode: 'BC', accountType: '13', currency: 'USD'},
  {name: 'BOC_CONSTRUCTION_GTB', bankFlag: y, code: '8110-0091', bankNum: '445571948034', bankCode: 'BC', accountType: '14', currency: 'CNY'},
  {name: 'CASH_CNY_GTB', bankFlag: y, code: '8120-001', bankNum: null, bankCode: 'CA', accountType: '11', currency: 'CNY'},
  {name: 'HSBC_CNY_PR', bankFlag: y, code: '8110-0092', bankNum: '088-560396-012', bankCode: 'HB', accountType: '11', currency: 'CNY'},
  {name: 'HSBC_CNY_GTBC', bankFlag: y, code: '8110-0104', bankNum: '088-560396-014', bankCode: 'HB', accountType: '11', currency: 'CNY'},
]

module.exports = async function (t) {
  // 非银行类别
  (xlsx.parse(path.join(mainPath, 'public/COA201801.xlsx')))[0].data.forEach((item) => {
    subjects.push({
      name: item[1], bankFlag: n, code: item[0]
    })
  })
  subjects[20].id = '111a73a0-06da-11e7-b23d-513f39f5849c'
  subjects[22].id = '801a73a0-06da-11e7-b23d-513f39f5849c'
  await models.subject.bulkCreate(subjects, {transaction: t})
}
