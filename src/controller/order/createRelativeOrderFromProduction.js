const config = require('config');
const helper = require(config.helperPath);
const service = require('../../service/index');
const moment = require('moment');

module.exports = (req, res) => {
  const rule = {
    order: {
      type: 'object',
      rule: {
        id: 'string',
        amount: {type: 'int', required: false},
        currency: {type: 'string', required: false},
        description: {type: 'string', required: false},
      }
    },
    orderDetail: {
      type: 'object',
      rule: {
        money: 'int',
        orderId: 'string',
      }
    },
    userId: 'string'
  };

  const args = helper.validate(res, rule, req.body);
  if (!args) return;

  const run = async args => {
    const order = await service.order.createRelativeOrderFromProduction(args);
    return order;
  }
  run(args).then(helper.success(res)).catch(helper.fail(res));
}
