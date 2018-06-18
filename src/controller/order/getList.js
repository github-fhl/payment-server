const
  {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {getOrderIds, getOrders, getWhere, getInclude} = require('../../service/order/getList')

module.exports = (req, res) => {
  const rule = {
    role: {type: 'string', required: true},
    applyStatus: {type: 'string', required: true},
    cashierType: {type: 'string', required: false},
    createdAt: {type: 'string', required: false},
    subjectStatus: {type: 'string', required: false},
    invoiceStatus: {type: 'string', required: false},
    description: {type: 'string', required: false, allowEmpty: true},
    vendorId: {type: 'string', required: false},
    subjectId: {type: 'string', required: false},
  }
  let args = validate(res, rule, req.query)
  if (!args) return

  if (args.createdAt) args.createdAt = JSON.parse(args.createdAt)

  async function run () {
    let orderIds = await getOrderIds(args.role, args.applyStatus, req.user)
    let where = getWhere(args, orderIds)
    let orderInclude = getInclude(args)
    let $orders = await getOrders(where, orderInclude, args.role, args.applyStatus, args.cashierType)

    return {orders: $orders, count: $orders.length}
  }

  run().then(success(res, true)).catch(fail(res))
}
