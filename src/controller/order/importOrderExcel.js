const {parseOrderExcel, formatParsedOrderExcel, create, get} = require('../../service/order');
const {helperPath, modelPath} = require('config');
const {validate, success, fail} = require(helperPath);
const {sequelize} = require(modelPath);

module.exports = (req, res) => {
    const rule = {
        filePath: 'string',
        type: {type: 'string', values: ['company', 'user']}
    };
    let args = validate(res, rule, req.params, req.body);
    if (!args) return
    if (args.type === 'company') {
        args.fileType = '公司';
    } else if (args.type === 'user') {
        args.fileType = '个人';
    }
    let run = async (t) => {
        let parsedResult = await parseOrderExcel(args.filePath, args.fileType);
        let formatResult = await formatParsedOrderExcel(parsedResult);
        let createResult = await create(formatResult.order, formatResult.details, {id: 'superMan'}, t);
        return await get({id: createResult.dataValues.id}, t);
    }
    sequelize.transaction(t => run(t))
        .then(success(res)).catch(fail(res));
}