const config = require('config');
const helper = require(config.helperPath);
const {models, sequelize} = require(config.modelPath);
const {cfg} = config;

module.exports = update;

/**
 * 更新 receipt
 * 1. 更新 receipt 数据
 * 2. 检查金额是否变更
 */

async function update(id, data, user, t) {
    helper.common.updateUsr(data, user);
    delete data.paidNo;

    await updateAmount(id, data, t)


    await models.receipt.update(data, {
        where: {id},
        transaction: t
    });
}


/**
 * 变更金额
 * 1. 如果变更金额，判断 receipt 是否已经做了凭证，如果做了，则不能变更金额
 * 2. 变更金额后，需要修改对应凭证借方中的银行金额
 */
async function updateAmount(id, data, t) {
    let $receipt = await models.receipt.findByPrimary(id, {
        transaction: t,
        include: [{
            model: models.bankStatement
        }]
    })

    if ($receipt.bankStatements[0].voucherId) throw new Error('已制作凭证，无法修改金额')
    await $receipt.update({money: data.amount}, {transaction: t})
}
