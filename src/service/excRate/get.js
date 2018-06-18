const {modelPath} = require('config'),
  {models} = require(modelPath);

module.exports = async (args) => {
  return await get(args);
}

let get = async (args) => {
  let excRate = await models.excRate.findOne({
    where: {
      date: args.date,
      currency: args.currency ? args.currency : 'USD'
    }
  })
  if (!excRate) {
    return null;
  }
  return excRate;
}