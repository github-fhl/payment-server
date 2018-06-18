const
  {modelPath, helperPath} = require('config'),
  {addUsr} = require(helperPath).common,
  {models} = require(modelPath)

/**
 * vendorDetail 规则：
 *  1. 根据 vendorId/bankNum/bankName 检查是否存在
 *    1. 存在
 *    2. 不存在，创建 vendorDetail
 */
async function createDetail (vendorDetail, user, t) {
  addUsr(vendorDetail, user)
  let result = await models.vendordetail.findOrCreate({
    where: {
      vendorId: vendorDetail.vendorId,
      bankNum: vendorDetail.bankNum,
      bankName: vendorDetail.bankName
    },
    defaults: vendorDetail,
    transaction: t
  })

  return result[0]
}
module.exports = createDetail
