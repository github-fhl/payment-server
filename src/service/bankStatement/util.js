const
  {modelPath, cfg} = require('config'),
  {models, sequelize} = require(modelPath),
  NP = require('number-precision');

module.exports.getMaxIndex = async (args, t) => {
  let maxIndex = await models.bankStatement.findOne({
    where: {subjectId: args.subjectId},
    attributes: [[sequelize.fn('max', sequelize.col('index')), 'index']],
    transaction: t
  });
  if (!maxIndex.dataValues.index) {
    return 0;
  }
  return maxIndex.dataValues.index;
}

module.exports.validateMaxBeforeDate = async (args, t) => {
  let maxBeforeData = await models.bankStatement.findOne({
    where: {
      subjectId: args.subjectId,
      index: args.index - 1
    },
    transaction: t
  })
  if (new Date(args.date) < maxBeforeData.date) {
    throw new Error('交易日期小于前一条记录的交易日期');
  }
  return;
}


module.exports.validateThisDate = async (args, t) => {
  let maxAfterData = await models.bankStatement.findOne({
    where: {
      subjectId: args.subjectId,
      index: args.index
    },
    transaction: t
  })
  if (new Date(args.date) > maxAfterData.date) {
    throw new Error('交易日期大于后一条记录的交易日期');
  }
  return;
}

module.exports.getMaxBankStatementByDate = async (option, args, t) => {
  let date;
  switch (option) {
    case 'Receipt':
      date = args.collectDate;
      break;
    case 'Payment':
      date = args.paidDate;
      break;
  }
  return models.bankStatement.findOne({
    where: {date: {$lte: date}, subjectId: args.subjectId},
    transaction: t,
    order: [['index', 'DESC']]
  })
}

module.exports.getInitBalance = async (option, args, t) => {
  if (args.index === 1) {
    let bankNum = await models.subject.findOne({
      where: {id: args.subjectId},
      attributes: ['name'],
      transaction: t,
      raw: true
    })

    if (!bankNum) {
      throw new Error('银行科目不存在');
    }
    return cfg.amount[bankNum.name];
  } else {
    let index;
    switch (option) {
      case 'this':
        index = args.index;
        break;
      case 'previous':
        index = args.index - 1;
        break;
    }
    let maxBeforeData = await models.bankStatement.findOne({
      where: {
        subjectId: args.subjectId,
        index: index
      },
      transaction: t
    })
    return maxBeforeData.balance;
  }
}

module.exports.getBankStatement = async (option, args, t) => {
  let where = {};
  switch (option) {
    case 'getById':
      where = {
        id: args.id
      };
      break;
    case 'next':
      where = {
        subjectId: args.subjectId,
        index: args.index + 1
      };
      break;
    case 'this':
      where = {
        subjectId: args.subjectId,
        index: args.index
      };
      break;
    case 'previous':
      where = {
        subjectId: args.subjectId,
        index: args.index - 1
      };
      break;
  }
  return await models.bankStatement.findOne({where: where, transaction: t, raw: true})
}


module.exports.getBankStatements = async (option, args, t) => {
  let where = {};
  switch (option) {
    case 'after':
      where = {
        subjectId: args.subjectId,
        index: {$gt: args.index}
      };
      break;
    case 'afterIncludeThis':
      where = {
        subjectId: args.subjectId,
        index: {$gte: args.index}
      };
      break;
  }
  return await models.bankStatement.findAll({where: where, transaction: t, raw: true});
}

module.exports.smallerIndex = async (bankStatement, bankStatementArray, t) => {
  for (let item of bankStatementArray) {
    item.index--;
    switch (bankStatement.transactionType) {
      case 'Payment':
        item.balance = NP.plus(item.balance, NP.plus(bankStatement.money, bankStatement.bankCharge));
        break;
      case 'Receipt':
        item.balance = NP.minus(item.balance, NP.minus(bankStatement.money, bankStatement.bankCharge));
        break;
    }
    await models.bankStatement.update({index: item.index, balance: item.balance}, {
      where: {id: item.id},
      transaction: t
    });
  }
  return;
}

module.exports.largerIndex = async (bankStatement, bankStatementArray, t) => {
  for (let item of bankStatementArray) {
    item.index++;
    switch (bankStatement.transactionType) {
      case 'Payment':
        item.balance = NP.minus(item.balance, NP.plus(bankStatement.money, bankStatement.bankCharge));
        break;
      case 'Receipt':
        item.balance = NP.plus(item.balance, NP.minus(bankStatement.money, bankStatement.bankCharge));
        break;
    }
    await models.bankStatement.update({index: item.index, balance: item.balance}, {
      where: {id: item.id},
      transaction: t
    });
  }
  return;
}

module.exports.updateThisBankStatement = async (args, user, t) => {
  let toUpdateBankStatement = {
    index: args.index,
    date: args.date,
    updatedUsr: user.id
  }
  await models.bankStatement.update(toUpdateBankStatement, {where: {id: args.id}, transaction: t});
  return;
}

module.exports.uniquePayTypeId = order => {
  let paytypeIdArray = [];
  order.orderdetails.forEach(item => {
    if (item.paytypedetailId) {
      paytypeIdArray.push(item.paytypedetailId);
    } else {
      paytypeIdArray.push(item.paytypeId);
    }
  })
  let set = new Set(paytypeIdArray);
  return Array.from(set).join('&');
}