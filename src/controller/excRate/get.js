const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {get} = require('../../service/excRate');

module.exports = (req, res) => {

  let rule = {
    date: {type: 'string', required: true, translate: 'date'},
    currency: {type: 'string', required: false}
  }

  let args = validate(res, rule, req.query);
  if (!args) return;

  async function run() {
    return await get(args);
  }

  run().then(success(res)).catch(fail(res));
}