const
  {modelPath} = require('config'),
  {models} = require(modelPath)

/**
 * - args
 *    - vendorId
 *    - subjectId
 */

module.exports = (args) => {
  let
    orderdetail = {
      model: models.orderdetail,
      where: {status: 1},
      include: [{
        model: models.company,
        attributes: ['name', 'code']
      }, {
        model: models.vendor,
        attributes: ['name', 'code']
      }, {
        model: models.reimuser,
        attributes: ['name']
      }, {
        model: models.paytype,
        attributes: ['category']
      }]
    },
    applylog = {
      model: models.applylog,
      where: {status: 1},
      separate: true,
      order: 'createdAt DESC'
    },
    company = {
      model: models.company,
      attributes: ['name', 'code']
    }

  if (args.vendorId) {
    orderdetail.where.vendorId = args.vendorId
  }

  return [company, orderdetail, applylog]
}

