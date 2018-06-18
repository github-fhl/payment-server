const
  {helperPath, modelPath} = require('config'),
  {sequelize} = require(modelPath),
  {validate, success, fail} = require(helperPath),
  {remove} = require('../../service/order')

module.exports = (req, res) => {
  const rule = {
    id: 'string'
  }
  let args = validate(res, rule, req.params)
  if (!args) return

  async function run (t) {
    let $order = await remove(args, req.user, t)
    return {order: $order}
  }

  sequelize.transaction(t => run(t))
    .then(success(res, true)).catch(fail(res))
}
