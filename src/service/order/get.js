const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  {getInclude} = require('./getList')

module.exports = async (args, t) => {
  let $order = await models.order.findByPrimary(args.id, {
    transaction: t,
    include: getInclude(args)
  })

  if (!$order) throw new Error(`${args.id} 不存在`)

  return $order
}
