const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  get = require('./get')

module.exports = async (args, user) => {
  let excRate = await get(args);
  if (!excRate) {
    return await createExcRate(args, user);
  }
  return await updateExcRate(excRate, args, user)
}

let createExcRate = async (args, user) => {
  let excRateInfo = {
    date: args.date,
    currency: args.currency ? args.currency : 'USD',
    rate: args.rate,
    createdUsr: user.id,
    updatedUsr: user.id
  }
  return await models.excRate.create(excRateInfo);
}

let updateExcRate = async (excRate, args, user) => {
  if (excRate.rate === args.rate) {
    return excRate;
  }
  await models.excRate.update({rate: args.rate}, {where: {id: excRate.id}});
  return models.excRate.findOne({where: {id: excRate.id}})
}