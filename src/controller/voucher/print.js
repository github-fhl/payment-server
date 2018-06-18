const
  {helperPath} = require('config'),
  {validate, fail} = require(helperPath),
  {getSource} = require('../../service/voucher');

module.exports = (req, res) => {

  const rule = {
    id: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.params, req.query)
  if (!args) return

  async function run() {
    let source = await getSource(args);
    res.render('Voucher', source);
  }

  run().then().catch(fail(res));

}