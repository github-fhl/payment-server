const {modelPath, helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {detail} = require('../../service/voucher');

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.params);
  if (!args) return

  async function run(t) {
    return await detail(args, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res));

}