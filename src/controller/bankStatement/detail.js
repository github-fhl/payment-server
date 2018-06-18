const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {detail} = require('../../service/bankStatement');

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true},
  };

  let args = validate(res, rule, req.params);
  if (!args) return;

  async function run() {
    return await detail(args);
  }

  run().then(success(res)).catch(fail(res));
}