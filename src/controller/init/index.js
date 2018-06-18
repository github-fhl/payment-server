const
  {helperPath, modelPath} = require('config'),
  {sequelize} = require(modelPath),
  {success, fail} = require(helperPath),
  {initSystem, initAccount, initPermission, initGrant} = require('../../service/init')

exports.init = function (req, res) {
  async function run (t) {
    await sequelize.sync({force: true})
    await initAccount(t)
    await initSystem(t)
    await initPermission(t)
    await initGrant(t)
  }

  sequelize.transaction(t => run(t))
    .then(success(res)).catch(fail(res))
}
