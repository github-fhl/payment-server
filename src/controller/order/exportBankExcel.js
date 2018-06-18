const
  {helperPath, modelPath} = require('config'),
  {sequelize} = require(modelPath),
  {validate, success, fail} = require(helperPath),
  {exportBankExcel} = require('../../service/order')

module.exports = (req, res) => {
  const rule = {
    orderIdArr: 'string',
  }
  let args = validate(res, rule, req.query)
  if (!args) return

  args.orderIdArr = JSON.parse(args.orderIdArr)

  async function run (t) {
    let result = await exportBankExcel(args.orderIdArr, t)
    return result
  }

  sequelize.transaction(t => run(t))
    .then(success(res, true)).catch(fail(res))
}
