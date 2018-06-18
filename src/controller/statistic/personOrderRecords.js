const config = require('config');
const helper = require(config.helperPath);
const service = require('../../service');

module.exports = (req, res) => {
    const rule = {
        voucherDate: {
            type: 'object',
            rule: {
                begin: 'string',
                end: 'string'
            }
        },

        reimusers: {
            type: 'array',
            required: false
        },

        companyId: {
            type: 'string',
            required: true
        },

        paytypes: {
            type: 'array',
            required: false
        },

        type: ['byMonth', 'byReimuser'],

        excludeType: {
            type: 'boolean',
            required: false,
            default: false
        }
    };
    const args = helper.validate(res, rule, req.body);
    if (!args) return;

    const run = async args => {
        const filePath = await service.statistics.reimuser(args);

        return filePath;
    };

    run(args).then(helper.success(res, true)).catch(helper.fail(res));
}