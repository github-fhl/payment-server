const
  {modelPath, cfg} = require('config'),
  {payOrReceive, paymentType} = cfg,
  {models, sequelize} = require(modelPath),
  moment = require('moment');

/**
 * 创建凭证流程
 * 第一步：校验银行流水是否已经做过凭证
 * 第二步：生成voucherId
 * 第三步：创建凭证
 * 第四步：创建凭证明细
 * 第五步：更新银行流水的voucherId字段
 * @param args
 * @param user
 * @param t
 * @returns {Promise<*>}
 */
module.exports = async (args, user, t) => {
  await validateVoucher(args.bankStatements, t);
  args = await getVoucherId(args, t);
  let voucher = await createVoucher(args, user, t);
  await createVoucherDetail(args, user, t);
  await updateVoucherIdOfBankStatement(args, t);
  await createApplyLog(args, user, t);
  return voucher;
}

/**
 * 校验该条流水记录是否已经做过凭证
 * @param bankStatements
 * @param t
 * @returns {Promise<void>}
 */
let validateVoucher = async (bankStatements, t) => {
  let result = await models.bankStatement.findAll({
    where: {id: bankStatements},
    transaction: t
  })
  for (let item of result) {
    if (item.voucherId) {
      throw new Error(`${item.id}已做过凭证`);
    }
  }
}

let getSubjectInfo = async (args, t) => {
  let subject;
  for (let item of args.voucherDetails) {
    if (item.bankFlag === 'y') {
      subject = await models.subject.findOne({
        where: {id: item.subjectId},
        attributes: ['accountType', 'bankCode'],
        transaction: t
      });
    }
  }
  return subject;
}

/**
 * 生成voucherId
 * @param args
 * @param t
 * @returns {Promise<string>}
 */
let getVoucherId = async (args, t) => {
  let voucherId;
  let date = moment(args.voucherDate).format('YYMM');
  let subjectInfo = await getSubjectInfo(args, t);
  let company = await getCompany(args, t);
  let $voucher = await models.voucher.findOne({
    where: {
      transactionType: args.transactionType,
      $and: [
        sequelize.where(sequelize.literal('substring(id from 3 for 4)'), {$eq: date}),
        sequelize.where(sequelize.literal('substring(id from 7 for 2)'), {$eq: subjectInfo.bankCode})
      ]
    },
    order: [[sequelize.literal('substring(id, -3)'), 'DESC']],
    transaction: t
  })
  if (!$voucher) {
    voucherId = date + subjectInfo.bankCode + payOrReceive[args.transactionType] + subjectInfo.accountType + '-' + paymentType[args.costType] + '001';
  }
  else {
    let num = parseInt($voucher.id.slice(-3)) + 1;
    num = num.prefix0(3);
    voucherId = `${$voucher.id.slice(2, 9)}${subjectInfo.accountType}${$voucher.id.slice(11, 12)}${paymentType[args.costType]}${num}`;
  }
  args.id = company.code + voucherId;
  return args;
}

let getCompany = async (args, t) => {
  return await models.company.findOne({where: {id: args.companyId}, attributes: ['code'], transaction: t});
}

let createVoucher = async (args, user, t) => {
  let voucherInfo = {
    id: args.id,
    costType: args.costType,
    voucherDate: args.voucherDate,
    transactionType: args.transactionType,
    remark: args.remark,
    flowStatus: "created",
    createdUsr: user.id,
    updatedUsr: user.id
  }
  if (args.vendorId) {
    voucherInfo.vendorId = args.vendorId
  }
  if (args.companyId) {
    voucherInfo.companyId = args.companyId
  }
  return await models.voucher.create(voucherInfo, {transaction: t});
}

let createVoucherDetail = async (args, user, t) => {
  let details = [];
  for (let item of args.voucherDetails) {
    item.voucherId = args.id;
    item.createdUsr = user.id;
    item.updateUsr = user.id;
    details.push(item);
  }
  await models.voucherdetail.bulkCreate(details, {transaction: t});
}

let updateVoucherIdOfBankStatement = async (args, t) => {
  await models.bankStatement.update({voucherId: args.id}, {where: {id: {$in: args.bankStatements}}, transaction: t});
}

let createApplyLog = async (args, user, t) => {
  let applyLog = {
    operation: 'create',
    applyStatus: 'handled',
    status: 1,
    voucherId: args.id,
    operator: user.id,
  }
  await models.applylog.create(applyLog, {transaction: t});
}
