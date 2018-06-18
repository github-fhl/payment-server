const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {getRest} = require('../../service/reimuser')

module.exports = (req, res) => {
  const rule = {
    reimuserId: 'string',
    validDate: 'string',
    paytypeId: {type: 'string', required: false},
    paytypedetailId: {type: 'string', required: false},
    orderType: {type: 'string', required: false},

  }
  let args = validate(res, rule, req.query)
  if (!args) return

  async function run () {
    let result = await getRest(args.reimuserId, args.validDate, args.paytypeId, args.paytypedetailId, args.orderType)

    if (result.rest > 100000000) {
      result.budget = 0
      result.rest = 0
    }
    return result
  }

  run().then(success(res)).catch(fail(res))
}
