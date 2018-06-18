const
  {modelPath, helperPath} = require('config'),
  {models} = require(modelPath),
  {common} = require(helperPath),
  moment = require('moment'),
  NP = require('number-precision')

module.exports = async (args, t) => {
  let obj = await list(args, t);
  return await listWithAmountCNY(obj, t)
}

async function list(args, t) {
  let where = {subjectId: args.subjectId};
  if (args.index) {
    where.index = args.index;
  }
  if (args.date && args.date.length > 0) {
    where.date = {$gte: args.date[0], $lte: args.date[1]};
  }
  if (args.commonId) {
    where.commonId = {$like: common.fuzzy(args.commonId)};
  }
  if (args.transactionType) {
    where.transactionType = args.transactionType;
  }
  if (args.voucherId) {
    where.voucherId = {$like: common.fuzzy(args.voucherId)};
  }
  if (args.description) {
    where.description = {$like: common.fuzzy(args.description)};
  }
  if (args.money) {
    where.money = args.money;
  }

  /**
   * 未做凭证的筛选条件下，移除每日自动结账的数据。已做凭证的筛选条件中，包含每日自动结账的数据
   * 之后的where条件必须加在此代码块前面
   */
  if (args.voucherFlag) {
    if (args.voucherFlag === 'y') {
      where = {
        ...where,
        $or: [
          {voucherId: {$ne: null}},
          {
            money: {$eq: 0},
            bankCharge: {$eq: 0}
          }
        ]
      }
    }
    if (args.voucherFlag === 'n') {
      where = {
        ...where,
        voucherId: {$eq: null},
        $or: [
          {
            money: {$ne: 0},
            bankCharge: {$ne: 0}
          },
          {
            money: {$ne: 0},
            bankCharge: {$eq: 0}
          },
          {
            money: {$eq: 0},
            bankCharge: {$ne: 0}
          },
        ]
      }
    }
  }

  let option = {
    where: where,
    include: [{
      model: models.subject,
      attributes: ['currency']
    }, {
      model: models.voucher,
      attributes: ['voucherDate']
    }],
    order: [['index', 'desc']],
    limit: 0,
    offset: 0,
    transaction: t
  }
  if (args.limit) {
    option.limit = args.limit;
  }
  if (args.offset) {
    option.offset = args.offset;
  }
  return await models.bankStatement.findAndCountAll(option)
}

let listWithAmountCNY = async (obj, t) => {
  for (let item of obj.rows) {
    if (item.subject.currency === 'CNY') {
      item.dataValues.amountCNY = 0;
    } else {
      let rate = await getExcRateByDate(moment(item.date).format('YYYY-MM-01'), item.subject.currency, t);
      item.dataValues.amountCNY = NP.times(item.balance, rate);
    }
  }
  obj.rows.sort(function (x, y) {
    return x.index - y.index;
  });
  return obj;
}

let getExcRateByDate = async (date, currency, t) => {
  let obj = await models.excRate.findOne({
    where: {date: date, currency: currency},
    attributes: ['rate'],
    transaction: t
  });
  if (!obj) {
    return 0;
  }
  return obj.rate;
}
