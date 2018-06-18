const
  common = require('./../../component/common')
  , models  = require('../../models').models
;

/**
 *
 * 出纳修改是否收到打印 order 的状态
 * @param req
 * @param res
 */
exports.updateReceiveOrderStatus = (req, res) => {
  let run = async () => {
    let args = {};
    if(
      common.getreqparameter(req, res, args, 'idArr', null, true, null) &&
      common.getreqparameter(req, res, args, 'action', null, true, null)
    ){
      await models.order.update({receiveOrderStatus: args.action}, {where: {id: {$in: args.idArr}}})
    }
  };
  run().then( ()=> common.ressendsuccess(req, res))
    .catch(common.catchsendmessage(req, res))
};
