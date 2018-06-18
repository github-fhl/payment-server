const
    StateMachine = require('javascript-state-machine'),
    config = require('config'),
    flowCfg = config.flowCfg,
    {toSubmit, toApproByFinance, refusedByFinance, toPayByCashier, toConfirmSucceed, paySucceed, payFailed, updatedByApplicant, abandoned} = flowCfg.expenseStatus,
    {create, submit, financeAppro, financeRefuse, cashierPay, cashierPayFailed, applicantUpdate, cashierPaySucceed, abandon} = flowCfg.expenseOperation,
    onBeforeTransition = require('./onBeforeTransition'),
    onCashierPaySucceed = require('./onCashierPaySucceed'),
    onCashierPay = require('./onCashierPay')

const transitions = [
    {name: create, from: ['none', toSubmit], to: toSubmit},
    {name: submit, from: [toSubmit, refusedByFinance], to: toApproByFinance},

    {name: financeAppro, from: toApproByFinance, to: toPayByCashier},
    {name: financeRefuse, from: toApproByFinance, to: refusedByFinance},

    {name: cashierPay, from: [toPayByCashier], to: toConfirmSucceed},
    {name: cashierPayFailed, from: [toConfirmSucceed, updatedByApplicant], to: payFailed},

    {name: applicantUpdate, from: payFailed, to: updatedByApplicant},

    {name: cashierPaySucceed, from: [toConfirmSucceed, updatedByApplicant], to: paySucceed},  //流程结束

    {name: abandon, from: [toSubmit, refusedByFinance], to: abandoned},  //流程结束
    {
        name: 'goto', from: '*', to: function (s) {
            return s
        }
    }
];

const ExpenseMachine = StateMachine.factory({
    transitions,

    data: ($expense, user, t, args = {}) => {
        if (!user) throw new Error('请登录')
        return {$expense, user, t, args}
    },

    methods: {
        init() {
            this.goto(this.$expense.approStatus)
            return this
        },

        /** 初始操作 */
        onBeforeTransition,

        /** 付款 **/
        onCashierPay,

        onCashierPaySucceed
    }
});

exports.ExpenseMachine = ExpenseMachine
exports.ExpenseTransitions = transitions
