const
  {modelPath} = require('config'),
  {models} = require(modelPath);

module.exports = async (args) => {
  return await detail(args);
}

let detail = async (args) => {
  return await models.bankStatement.findOne({
    where: {id: args.id}
  })
}