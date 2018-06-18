const
    {helperPath, modelPath} = require('config'),
    {sequelize} = require(modelPath),
    {validate, success, fail} = require(helperPath),
    {create} = require('../../service/receipt')

module.exports = (req, res) => {
    const rule = {
        description: {type: 'string', required: false, allowEmpty: true},
        currency: 'string',
        amount: 'int',
        amountCNY: {type: 'int', required: false},
        excRate: {type: 'number', required: false},
        collectDate: 'date',
        voucherDate: {type: 'date', required: false},
        filePath: {type: 'string', required: false, allowEmpty: true},
        remark: {type: 'string', required: false, allowEmpty: true},
        subjectId: 'string',
        companyId: {type: 'string', required: true},
        payer: {type: 'string', required: false},
    };
    const args = validate(res, rule, req.body);
    if (!args) return;

    async function run(t) {
        const receipt = await create(args, req.user, t);
        return receipt;
    }

    sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res))
}
