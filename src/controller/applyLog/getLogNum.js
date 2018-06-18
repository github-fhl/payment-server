const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {getLogNum} = require('../../service/applyLog')

module.exports = (req, res) => {
  const rule = {
    id: 'string'
  }
  let args = validate(res, rule, req.params)
  if (!args) return

  async function run () {
    let result = await getLogNum(args)

    return {
      applylogs: result
    }
  }

  run().then(success(res, true)).catch(fail(res))
}
