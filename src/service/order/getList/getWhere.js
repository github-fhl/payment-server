/**
 * - args
 *    - createdAt = ["2017-05-06 00:00:00","2017-11-06 23:59:59"]
 *    - subjectStatus
 *    - invoiceStatus
 *    - description
 *    - paidNo
 */
const {helperPath} = require('config'),
  {fuzzy} = require(helperPath).common


module.exports = (args, orderIds) => {
  let where = {
    status: 1,
    id: {$in: orderIds},
  }

  if (args.createdAt) {
    where.createdAt = {
      $gte: args.createdAt[0],
      $lte: args.createdAt[1]
    }
  }

  ['subjectStatus', 'invoiceStatus'].forEach(key => {
    if (args[key]) where[key] = args[key]
  })

  if (args.description) {
    where.description = {$like: fuzzy(args.description)}
  }

  if (args.subjectId) {
    where.subjectId = args.subjectId
  }

  return where
}
