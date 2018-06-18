const
  {helperPath, modelPath} = require('config'),
  {sequelize} = require(modelPath),
  {validate, success, fail} = require(helperPath),
  {updateAmountCNY} = require('../../service/order')

module.exports = (req, res) => {
  const rule = {
    id: 'string',
    amountCNY: 'number'
  }
  let args = validate(res, rule, req.params, req.body)
  if (!args) return

  async function run (t) {
    await updateAmountCNY(args, req.user, t)
  }

  sequelize.transaction(t => run(t))
    .then(success(res)).catch(fail(res))
}
