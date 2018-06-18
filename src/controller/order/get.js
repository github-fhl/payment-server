const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {get} = require('../../service/order')

module.exports = (req, res) => {
  const rule = {
    id: 'string'
  }
  let args = validate(res, rule, req.params)
  if (!args) return

  async function run () {
    let $order = await get(args)
    return {order: $order}
  }

  run().then(success(res, true)).catch(fail(res))
}
