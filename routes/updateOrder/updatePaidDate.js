const
  common = require('./../../component/common')
  , models  = require('../../models').models
;

/**
 *
 * 出纳修改付款日期
 * @param req
 * @param res
 */
exports.updatePaidDate = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'id', null, true, null) &&
      common.getreqparameter(req, res, args, 'paidDate', null, true, null)
    ){
      await models.order.update({paidDate: args.paidDate}, {where: {id: args.id}})
    }
  };
  run().then( ()=> common.ressendsuccess(req, res))
    .catch(common.catchsendmessage(req, res))
};
