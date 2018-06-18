const
  {models} = require(require('config').modelPath),
  moment = require('moment')

/**
 * 生成报销单的 id
 */
async function generatorId (t) {

  let date = moment().format('YYYYMM')
  let max = await models.order.max('id', {
    where: {id: {$like: `NE${date}%`}},
    transaction: t
  })
  if (!max) return `NE${date}001`
  return `NE${(parseInt(max.slice(2)) + 1)}`
}
module.exports = generatorId
