const
  {modelPath} = require('config'),
  {models} = require(modelPath)

let companys = [
  {id: '24787240-06da-11e7-b23d-513f39f5849c',name: 'GTB AP CENTRAL', logoPath: 'upload/20170327/logo1.png', code: 'BH', codeToVoucher: 'BH'},
  {id: '24787241-06da-11e7-b23d-513f39f5849c',name: 'Prism', logoPath: 'upload/20170327/logo2.png', code: 'PR', codeToVoucher: 'Prism'},
  {id: '12387241-06da-11e7-b23d-513f39f5849c',name: 'GTB CHINA', logoPath: 'upload/20171213/93038f90-e002-11e7-ab0b-4501edb52f27.png', code: 'GC', codeToVoucher: 'GTBC'},
  {id: '56787241-06da-11e7-b23d-513f39f5849c',name: 'VML', logoPath: '', code: 'VM', codeToVoucher: 'VML'}
];

module.exports = async function (t) {
  await models.company.bulkCreate(companys, {transaction: t})
}
