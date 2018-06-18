const
  {modelPath, helperPath} = require('config'),
  {common} = require(helperPath),
  {models} = require(modelPath);

module.exports = async (args) => {
  return await list(args);
}

let list = async (args) => {
  let where = {transactionType: args.transactionType};
  let detailWhere = {bankFlag: 'y'};
  if (args.voucherId) {
    where.id = {$like: common.fuzzy(args.voucherId)};
  }
  if (args.voucherDate && args.voucherDate.length > 0) {
    where.voucherDate = {$gte: args.voucherDate[0], $lte: args.voucherDate[1]};
  }
  if (args.subjectId) {
    detailWhere.subjectId = args.subjectId;
  }
  if (args.money) {
    detailWhere.money = args.money;
  }
  if (args.flowStatus) {
    where.flowStatus = args.flowStatus;
  }
  if (args.costType) {
    where.costType = args.costType
  }
  let option = {
    where: where,
    include: [{
      model: models.voucherdetail,
      where: detailWhere,
      required: true,
      include: [{
        model: models.subject,
        attributes: ['id', 'code', 'bankNum']
      }]
    }],
    limit: 0,
    offset: 0
  }
  if (args.limit) {
    option.limit = args.limit;
  }
  if (args.offset) {
    option.offset = args.offset;
  }
  return models.voucher.findAll(option)
}

