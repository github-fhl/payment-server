const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  moment = require('moment');

module.exports = async (args) => {
  let voucher = await getVoucher(args);
  if (!voucher) {
    throw new Error('该凭证不存在');
  }
  return await formatVoucher(voucher);
}

let getVoucher = async args => {
  return await models.voucher.findOne({
    where: {id: args.id},
    attributes: ['id', 'voucherDate', 'transactionType'],
    include: [{
      model: models.voucherdetail,
      attributes: ['money', 'subjectId', 'remark', 'type'],
      include: [{
        model: models.subject,
        attributes: ['name', 'code']
      }]
    }, {
      model: models.vendor,
      attributes: ['name', 'code'],
      required: false
    }, {
      model: models.company,
      attributes: ['logoPath'],
      required: false
    }, {
      model: models.applylog,
      required: false,
      separate: true,
      order: [['createdAt', 'desc']],
      include: [{
        model: models.account,
        as: 'Operator',
        include: [{
          model: models.signature,
          attributes: ['path']
        }]
      }]
    }]
  });
}

let formatVoucher = async voucher => {
  let name;
  let details = [];
  let amount = 0;

  let sign = await getSign(voucher.applylogs);

  for (let item of voucher.voucherdetails) {
    if (voucher.transactionType === 'Payment') {
      if (item.type === 'credit') {
        name = item.subject.code;
        break;
      }
      amount = amount + item.money;
      details.push({
        money: item.money,
        subject: {
          name: item.subject.name,
          code: item.subject.code,
        },
        description: item.remark
      })
    } else {
      if (item.type === 'debit') {
        name = item.subject.code;
        break;
      }
      amount = amount + item.money;
      details.push({
        money: item.money,
        subject: {
          name: item.subject.name,
          code: item.subject.code,
        },
        description: item.remark
      })

    }
  }

  return {
    name,
    amount,
    details,
    paidNo: voucher.id,
    enterPath: sign.enterPath,
    cashierPath: sign.cashierPath,
    approvedPath: sign.approvedPath,
    vendorName: voucher.vendor ? voucher.vendor.name : '',
    vendorCode: voucher.vendor ? voucher.vendor.code : '',
    logoPath: voucher.company ? voucher.company.logoPath : '',
    transactionType: voucher.transactionType,
    year: moment(voucher.voucherDate).format('YYYY'),
    month: moment(voucher.voucherDate).format('MM'),
    day: moment(voucher.voucherDate).format('DD')
  };

}

let getSign = async args => {
  if (args[0].operation === 'create') {
    return {
      enterPath: '',
      approvedPath: '',
      cashierPath: randomSignature(args[0].Operator.signatures)
    }
  } else {
    let approved = await models.signature.findAll({where: {accountId: 'A_chief'}, attributes: ['path']});
    return {
      enterPath: randomSignature(args[args.length - 1].Operator.signatures),
      approvedPath: randomSignature(approved),
      cashierPath: randomSignature(args[0].Operator.signatures)
    }
  }
}

let randomSignature = args => {
  if (args.length === 0) {
    return '';
  }
  let index = parseInt(Math.random() * args.length);
  return args[index].path;
}
