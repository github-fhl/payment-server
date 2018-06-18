const
    {helperPath, modelPath} = require('config'),
    {sequelize} = require(modelPath),
    {validate, success, fail} = require(helperPath),
    {update, findOne} = require('../../service/receipt')

module.exports = (req, res) => {
    const rule = {
        description: {type: 'string', required: false, allowEmpty: true},
        currency: {type: 'string', required: false, allowEmpty: true},
        amount: {type: 'int', required: false},
        amountCNY: {type: 'int', required: false},
        excRate: {type: 'number', required: false},
        collectDate: {type: 'date', required: false},
        voucherDate: {type: 'date', required: false},
        filePath: {type: 'string', required: false, allowEmpty: true},
        remark: {type: 'string', required: false, allowEmpty: true},
        companyId: {type: 'string', required: true},
        payer: {type: 'string', required: false},
    };
    const args = validate(res, rule, req.body);
    if (!args) return;

    async function run(t) {
      await update(req.params.id, args, req.user, t);
      const receipt = await findOne(req.params.id);
      return receipt;
    }

    sequelize.transaction(t => run(t))
        .then(success(res)).catch(fail(res))
}