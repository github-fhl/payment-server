const
  {helperPath, modelPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {update} = require('../../service/bankStatement');

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true},
    costType: {type: 'string', required: true},
    subjectId: {type: 'string', required: true},
    index: {type: 'number', required: true, min: 1},
    date: {type: 'date', required: true},
    commonId: {type: 'string', required: false, allowEmpty: true},
    description: {type: 'string', required: true},
    money: {type: 'number', required: true},
    bankCharge: {type: 'number', required: true},
    transactionType: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.params, req.body);
  if (!args) return;

  async function run(t) {
    return await update(args, req.user, t)
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res));
}