const
  {helperPath} = require('config'),
  {success, fail} = require(helperPath),
  {getPayType} = require('../../service/statistics');

module.exports = (req, res) => {

  let run = async () => {
    return await getPayType();
  }

  run().then(success(res)).catch(fail(res))
}