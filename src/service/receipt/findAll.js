const config = require('config');
const helper = require(config.helperPath);
const {models} = require(config.modelPath);

module.exports = findAll;

async function findAll(query) {
  const where = {};
  const opts = {
    include: [
      {
        model: models.subject,
        attributes: ['name']
      },
      {
        model: models.bankStatement,
        attributes: ['voucherId']
      }
    ],
    order: [['createdAt', 'DESC']]
  };
  opts.where = where;

  if (query.collectDate) {
    const range = JSON.parse(query.collectDate);
    where.collectDate = {
      $gte: range[0],
      $lte: range[1]
    };
  }

  if (query.currency) where.currency = query.currency;


  if (query.amount) where.amount = query.amount;

  if (query.amountCNY) where.amountCNY = query.amountCNY;

  if (query.description) where.description = {$like: helper.common.fuzzy(query.description)};

  if (query.limit) opts.limit = query.limit;

  if (query.offset) opts.offset = query.offset;

  let objs = await models.receipt.findAll(opts);
  objs = objs.map(obj => {
    const receipt = obj.toJSON();

    receipt.subjectName = receipt.subject.name;
    receipt.voucherId = receipt.bankStatements[0].voucherId;
    return receipt;
  });

  return objs;
}
