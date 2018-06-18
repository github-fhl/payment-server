const
  {modelPath, cfg} = require('config'),
  {models, sequelize} = require(modelPath),
  moment = require('moment'),
  schedule = require('node-schedule'),
  create = require('../src/service/bankStatement/create');

let run = async (t) => {
  let yesterday = moment().add(-1, 'd').format('YYYY-MM-DD');
  let subjectIds = await getSubjectId(t);
  for (let item of subjectIds) {
    let bankStatementInfo = {
      date: yesterday,
      type: null,
      transactionType: 'Payment',
      description: '每日自动结账',
      money: 0,
      bankCharge: 0,
      costType: 'Inhouse',
      commonId: null,
      subjectId: item.id,
      voucherId: null
    };
    let yesterdayBankStatement = await getYesterdayBankStatementBySubjectId(item, yesterday, t);

    if (yesterdayBankStatement) continue

    let maxBankStatementBySubjectId = await getMaxBankStatementBySubjectId(item, yesterday, t);
    if (!maxBankStatementBySubjectId) {
      bankStatementInfo.index = 1;
      bankStatementInfo.balance = cfg.amount[item.name];
    } else {
      bankStatementInfo.index = maxBankStatementBySubjectId.index + 1;
      bankStatementInfo.balance = maxBankStatementBySubjectId.balance;
    }
    await create(bankStatementInfo, {id: null}, t)
  }
}

let getSubjectId = async t => {
  return await models.subject.findAll({
    where: {bankFlag: 'y'},
    attributes: ['id', 'name'],
    raw: true,
    transaction: t
  })
}

let getYesterdayBankStatementBySubjectId = async (subjectId, yesterday, t) => {
  return await models.bankStatement.findOne({
    where: {
      subjectId: subjectId.id,
      date: {$eq: yesterday}
    },
    raw: true,
    transaction: t
  })
}

let getMaxBankStatementBySubjectId = async (subjectId, yesterday, t) => {
  return await models.bankStatement.findOne({
    where: {
      subjectId: subjectId.id,
      date: {$lt: yesterday}
    },
    order: [['index', 'desc']],
    raw: true,
    transaction: t
  })
}

schedule.scheduleJob('0 0 1 * * *', () => {
  sequelize.transaction(t => run(t)).catch(err => console.log(err));
})
