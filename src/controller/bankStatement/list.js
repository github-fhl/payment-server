const
  {modelPath, helperPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {list} = require('../../service/bankStatement');

module.exports = (req, res) => {
  const rule = {
    subjectId: {type: 'string', required: true},
    index: {type: 'string', required: false, translate: 'number'},
    date: {type: 'string', required: false},
    commonId: {type: 'string', required: false},
    transactionType: {type: 'enum', values: Object.values(cfg.transactionType), required: false},
    voucherId: {type: 'string', required: false},
    voucherFlag: {type: 'string', required: false},
    description: {type: 'string', required: false},
    money: {type: 'string', required: false, translate: 'number'},
    limit: {type: 'string', required: true, translate: 'number'},
    offset: {type: 'string', required: true, translate: 'number'}
  };

  let args = validate(res, rule, req.query);
  if (!args) return;

  async function run(t) {
    if (args.date) {
      args.date = JSON.parse(args.date);
      if (!Array.isArray(args.date)) {
        throw new Error('传入的交易日期必须是数组');
      }
    }
    return await list(args, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res));
}