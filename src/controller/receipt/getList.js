const config = require('config');
const helper = require(config.helperPath);
const service = require('../../service');

module.exports = (req, res) => {
  const rule = {
    collectDate: {type: 'string', required: false}, // start,end 如果没有,默认为开始时间,
    currency: {type: 'string', required: false},
    amount: {type: 'string', required: false, translate: 'integer'},
    amountCNY: {type: 'string', required: false, translate: 'integer'},
    subjectName: {type: 'string', required: false},
    description: {type: 'string', required: false},
    limit: {type: 'string', required: false, default: 20, translate: 'integer'},
    offset: {type: 'string', required: false, default: 0, translate: 'integer'},
  };
  const args = helper.validate(res, rule, req.query);
  if (!args) return;
  const run = async args => {
    const receipts = await service.receipt.findAll(args);
    return receipts;
  };

  run(args).then(helper.success(res)).catch(helper.fail(res));
}
