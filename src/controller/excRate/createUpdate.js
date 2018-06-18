const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {createUpdate} = require('../../service/excRate');

module.exports = (req, res) => {

  let rule = {
    date: {type: 'string', required: true, translate: 'date'},
    currency: {type: 'string', required: false},
    rate: {type: 'number', required: true}
  }

  let args = validate(res, rule, req.body);
  if (!args) return;

  async function run() {
    return await createUpdate(args, req.user);
  }

  run().then(success(res)).catch(fail(res));
}