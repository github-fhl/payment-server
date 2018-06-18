const
  {helperPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {list} = require('../../service/voucher')

module.exports = (req, res) => {
  const rule = {
    voucherId: {type: 'string', required: false},
    voucherDate: {type: 'string', required: false},
    subjectId: {type: 'string', required: false},
    money: {type: 'string', required: false, translate: 'number'},
    flowStatus: {type: 'string', required: false},
    costType: {type: 'string', required: false},
    limit: {type: 'string', required: false, translate: 'number'},
    offset: {type: 'string', required: false, translate: 'number'},
    transactionType: {type: 'enum', values: Object.values(cfg.transactionType), required: true},
  }
  let args = validate(res, rule, req.query);
  if (!args) return;

  async function run() {
    if (args.voucherDate) {
      args.voucherDate = JSON.parse(args.voucherDate);
      if (!Array.isArray(args.voucherDate)) {
        throw new Error('传入的凭证日期必须是数组');
      }
    }
    return await list(args);
  }

  run().then(success(res)).catch(fail(res));
}