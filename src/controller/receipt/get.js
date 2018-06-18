const config = require('config');
const helper = require(config.helperPath);
const service = require('../../service');

module.exports = (req, res) => {
  const rule = {
    id: 'string'
  };
  const args = helper.validate(res, rule, req.params);
  if (!args) return;
  const run = async args => {
    const receipt = await service.receipt.findOne(args.id);
    return receipt;
  };

  run(args).then(helper.success(res)).catch(helper.fail(res));
}