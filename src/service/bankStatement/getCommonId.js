const
  {modelPath, helperPath} = require('config'),
  {models} = require(modelPath),
  {common} = require(helperPath);

module.exports = async args => {
  if (args.transactionType === 'Payment') {
    let orders = await getOrders(args);
    return formatOrders(orders);
  } else {
    let receipts = await getReceipts(args);
    return formatReceipts(receipts)
  }
}

let getOrders = async args => {
  let where = {
    id: {$like: common.fuzzy(args.mark)},
    approStatus: 'PaySucceed'
  }
  if (args.subjectId) {
    where.subjectId = args.subjectId
  }
  return models.order.findAll({
    where: where,
    include: [{
      model: models.orderdetail,
      include: [{
        model: models.vendor,
        attributes: ['name']
      }],
      attributes: ['paytypeId']
    }, {
      model: models.bankStatement,
      attributes: ['money', 'bankCharge']
    }, {
      model: models.company,
      attributes: ['name']
    }],
    attributes: ['id', 'vendorType', 'amount', 'bankCharge']
  })
}

let getReceipts = async args => {
  let where = {
    id: {$like: common.fuzzy(args.mark)}
  }
  if (args.subjectId) {
    where.subjectId = args.subjectId
  }
  return models.receipt.findAll({
    where: where,
    include: [{
      model: models.bankStatement,
      attributes: ['money', 'bankCharge']
    }],
    attributes: ['id', 'description', 'payer', 'amount', 'bankCharge'],
  })
}

let formatOrders = orders => {
  let array = [];
  orders.forEach(item => {
    item.bankStatements.forEach(bankStatement => {
      item.amount = item.amount - bankStatement.money;
      item.bankCharge = item.bankCharge - bankStatement.bankCharge;
    })
    array.push({
      id: item.id,
      description: item.company.name,
      money: item.amount,
      bankCharge: item.bankCharge
    });
  })
  return array;
}

let formatReceipts = receipts => {
  let array = [];
  receipts.forEach(item => {
    item.bankStatements.forEach(bankStatement => {
      item.amount = item.amount - bankStatement.money;
      item.bankCharge = item.bankCharge - bankStatement.bankCharge;
    })
    array.push({
      id: item.id,
      description: item.description ? item.payer + item.description : item.payer,
      money: item.amount,
      bankCharge: item.bankCharge
    });
  })
  return array;
}