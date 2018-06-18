const
  {modelPath, helperPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {create} = require('../../service/bankStatement'),
  {sequelize} = require(modelPath);

module.exports = (req, res) => {
  const rule = {
    costType: {type: 'string', required: true},
    subjectId: {type: 'string', required: true},
    index: {type: 'number', required: true, min: 1},
    date: {type: 'date', required: true},
    transactionType: {type: 'enum', values: Object.values(cfg.transactionType), required: true},
    commonId: {type: 'string', required: false, allowEmpty: true},
    description: {type: 'string', required: true},
    money: {type: 'number', required: true},
    bankCharge: {type: 'number', required: true}
  };

  let args = validate(res, rule, req.body);
  if (!args) return;

  async function run(t) {
    args.checkAmountAndBankcharge = 'Y';
    return await create(args, req.user, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
