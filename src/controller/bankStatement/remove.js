const
  {helperPath, modelPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {remove} = require('../../service/bankStatement');

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.params);
  if (!args) return;

  async function run(t) {
    args.validateVoucher = 'Y';
    await remove(args, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}