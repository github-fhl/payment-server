const
    {
      create, update, updateAmountCNY, exportBankExcel, getList, get,
      importOrderExcel, applicantUpdateDetails, createRelativeOrderFromProduction, remove,
      updateByCashier
    } = require('../controller/order'),
    {handler} = require('../controller/handleStateMachine')

module.exports = (router, rbac) => {
    router.route('/download/bankInfo')
        .get(exportBankExcel)

    router.route('/orders')
        .get(getList)
        .post(create)

    router.route('/importOrderExcel')
        .post(importOrderExcel)

    router.route('/orders/:id')
        .get(get)
        .put(update)
        .delete(remove)

    router.route('/amountCNY/orders/:id')
        .put(updateAmountCNY)

    router.route('/applicantUpdateDetails/:id')
        .put(applicantUpdateDetails)

    router.route('/:handle/orders')
        .put(handler)

    router.route('/order2s/production/createRelativeOrder')
        .post(createRelativeOrderFromProduction)

    router.route('/updateByCashier/:id')
        .put(updateByCashier)
}
