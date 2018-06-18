const
  {modelPath} = require('config'),
  {models} = require(modelPath)

let accounts = [
  {id: 'superMan', name: '超人', nickname: '1', managerUsr: 'superMan', directorUsr: 'superMan', department: '财务部', telephoneNumber: 110},
  {id: 'shscan', name: 'shscan', nickname: '2', managerUsr: 'shscan', directorUsr: 'shscan', department: '财务部', telephoneNumber: 110}
];
let signatures = [
  {id: '98c680b0-12a1-11e7-922d-e717b0d3d397', path: `upload/20170327/1.png`, accountId: 'superMan'},
  {id: '98c6a7c0-12a1-11e7-922d-e717b0d3d397', path: `upload/20170327/2.png`, accountId: 'shscan'}
];
let roles = [{id: 'admin', name: '管理员'}];
let accountroles = [
  {accountId: 'superMan', roleId: 'admin'},
  {accountId: 'shscan', roleId: 'admin'},
];

module.exports = async function (t) {
  await models.account.bulkCreate(accounts, {transaction: t})
  await models.signature.bulkCreate(signatures, {transaction: t})
  await models.role.bulkCreate(roles, {transaction: t})
  await models.accountrole.bulkCreate(accountroles, {transaction: t})
}
