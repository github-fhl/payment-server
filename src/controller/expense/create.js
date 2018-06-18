const
  {helperPath, modelPath} = require('config'),
  moment = require('moment'),
  {sequelize} = require(modelPath),
  {validate, success, fail} = require(helperPath),
  {create, importExcel} = require('../../service/expense')

module.exports = (req, res) => {
  const rule = {
    filePath: {type: 'string', required: true},
    sheetName: {type: 'string', required: true},
    paymentDate: {type: 'date', required: true}
  }
  let args = validate(res, rule, req.body)
  if (!args) return

  args.paymentDate = moment(args.paymentDate).format('YYYY-MM-DD')

  async function run (t) {
    let expense = await importExcel(args.filePath, args.sheetName, args.paymentDate, t)
    await create(expense, req.user, t)
  }

  sequelize.transaction(t => run(t))
    .then(success(res)).catch(fail(res))
}
