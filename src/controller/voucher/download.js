const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {getSource, download} = require('../../service/voucher');

module.exports = (req, res) => {

  const rule = {
    id: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.params, req.query)
  if (!args) return

  async function run() {
    let obj = await getSource(args);
    return await download(obj)
  }

  run().then(success(res)).catch(fail(res));
}