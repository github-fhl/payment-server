const
  {modelPath, helperPath} = require('config'),
  {addUsr} = require(helperPath).common,
  {models} = require(modelPath)

/**
 * vendor 规则：
 *  1. 根据 vendorName 检查是否存在
 *    1. 存在，则不创建
 *    2. 不存在
 *      1. 判断是否存在code，不存在则给予 A000 的 code
 *      2. 根据 code 查询是否存在 vendor，如果存在 vendor 且 code 为非 A000，则报错
 *      3. 创建 vendor
 *
 * vendor
 *    - code
 *    - name
 *    - vendorType
 */
async function create (vendor, user, t) {
  addUsr(vendor, user)
  let $vendor = await models.vendor.findOne({
    transaction: t,
    where: {name: vendor.name}
  })

  if ($vendor) return $vendor

  if (!vendor.code) vendor.code = 'A000'
  if (vendor.code !== 'A000') {
    $vendor = await models.vendor.findOne({
      transaction: t,
      where: {code: vendor.code}
    })
    if ($vendor) throw new Error(`Vendor Code - ${vendor.code} 已存在！`)
  }

  return await models.vendor.create(vendor, {transaction: t})
}
module.exports = create
