const
  {modelPath, mainPath} = require('config'),
  {models, sequelize} = require(modelPath),
  fs = require('fs'),
  path = require('path')

module.exports = async function (t) {
  let permissionSQL = fs.readFileSync(path.join(mainPath, 'permission.sql'), 'utf8');
  let permissionArr = permissionSQL.split(';');

  for (let i = 0, len = permissionArr.length; i < len; i ++){
    let item = permissionArr[i];
    if (item.indexOf('INSERT') === -1) continue;
    await sequelize.query(item, {transaction: t});
    let permissionId = item.split("VALUES ('")[1].split("'")[0];
    let grant = {roleId: 'admin', targetpermissionId: permissionId};
    await models.grant.create(grant, {transaction: t})
  }
}
