const
  remove = require('./remove'),
  create = require('./create'),
  {getBankStatement} = require('./util');

/**
 * 更新流水号
 * 第一步：获取该条银行流水记录并保存
 * 第二步：根据新的流水号更新该条流水记录的日期
 * 第三步：将原纪录删除
 * 第四步：更具保存的记录重新创建一条银行流水
 * @param args
 * @param user
 * @param t
 * @returns {Promise<void>}
 */
module.exports = async (args, user, t) => {
  let bankStatement = await getBankStatement('getById', args, t);
  args.subjectId = bankStatement.subjectId;
  bankStatement.date = await getDate(bankStatement, args, t);
  bankStatement.index = args.index;
  await remove(args, t);
  await create(bankStatement, user, t)
}

/**
 * 获取新的银行流水日期
 * 第一步：获取后一条记录
 * 第二步：获取前一条记录
 * 第三步：判断后一条记录是否存在，如果不存在返回前一条记录的日期
 * 第四步：如果后一条记录存在判断其日期是否与本条银行流水记录的日期相同，
 * 如果相同返回后一条记录的日期，如果不相同返回前一条记录的日期
 * @param args
 * @param t
 * @returns {Promise<*>}
 */
let getDate = async (bankStatement, args, t) => {
  let nextDate;
  let previousDate
  if (args.index - bankStatement.index > 0) {
    nextDate = await getBankStatement('next', args, t);
    previousDate = await getBankStatement('this', args, t);
  } else {
    nextDate = await getBankStatement('this', args, t);
    previousDate = await getBankStatement('previous', args, t);
  }
  if (!nextDate) {
    return previousDate.date;
  } else {
    if (nextDate.date !== args.date) {
      if (!previousDate) {
        return nextDate.date;
      } else {
        return previousDate.date;
      }
    }
  }
}