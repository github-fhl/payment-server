const
  {modelPath, helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {changeIndex} = require('../../service/bankStatement');

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true},
    index: {type: 'number', required: true}
  }

  let args = validate(res, rule, req.body);
  if (!args) return;

  async function run(t) {
    return await changeIndex(args, req.user, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res));
}