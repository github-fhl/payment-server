const
  {models} = require(require('config').modelPath),
  moment = require('moment')

/**
 * 生成 order 的 id 号
 */

async function generatorId (t) {

  let date = moment().format('YYYYMM')
  let max = await models.order.max('id', {
    where: {id: {$like: `PR${date}%`}},
    transaction: t
  })
  if (!max) return `PR${date}001`
  return `PR${(parseInt(max.slice(2)) + 1)}`
}
module.exports = generatorId
