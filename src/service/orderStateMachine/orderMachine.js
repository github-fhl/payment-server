const
  StateMachine = require('javascript-state-machine'),
  config = require('config'),
  flowCfg = config.flowCfg,
  {
    toSubmit, toApproByManager, refusedByManager, toApproByCashier, refusedByCashier,
    refusedByIC, toApproByIC,
    toApproByFinance, refusedByFinance, toApproByChief, refusedByChief,
    toPayByCashier, payFailed, updatedByApplicant, paySucceed, abandoned,
    toConfirmSucceed
  } = flowCfg.orderStatus,
  {
    create, submit, backout, managerAppro, managerRefuse,
    cashierAppro, cashierRefuse, cashierApproToIC, icAppro, icRefuse, financeAppro, financeRefuse,
    chiefAppro, chiefRefuse, cashierPayFailed, applicantUpdate,
    cashierPaySucceed, abandon,
    cashierPay
  } = flowCfg.orderOperation,
  onBeforeTransition = require('./onBeforeTransition'),
  onCashierAppro = require('./onCashierAppro'),
  onCashierApproToIC = require('./onCashierApproToIC'),
  onCashierPaySucceed = require('./onCashierPaySucceed'),
  onCashierPay = require('./onCashierPay')

const transitions = [
  {name: create, from: ['none', toSubmit],  to: toSubmit},
  {name: submit, from: [toSubmit, refusedByManager, refusedByCashier, refusedByFinance, refusedByChief, refusedByIC],  to: toApproByManager},
  {name: backout, from: toApproByManager,  to: toSubmit},

  {name: managerAppro, from: toApproByManager,  to: toApproByCashier},
  {name: managerRefuse, from: toApproByManager,  to: refusedByManager},

  {name: cashierAppro, from: toApproByCashier, to: toApproByFinance},
  {name: cashierRefuse, from: toApproByCashier, to: refusedByCashier},

  {name: cashierApproToIC, from: toApproByCashier, to: toApproByIC},

  {name: icAppro, from: toApproByIC, to: toApproByFinance},
  {name: icRefuse, from: toApproByIC, to: refusedByIC},

  {name: financeAppro, from: toApproByFinance, to: toApproByChief},
  {name: financeRefuse, from: toApproByFinance, to: refusedByFinance},

  {name: chiefAppro, from: [toApproByFinance, toApproByChief], to: toPayByCashier},  //可以跳过财务，直接由总监进行批准
  {name: chiefRefuse, from: toApproByChief, to: refusedByChief},

  {name: cashierPay, from: toPayByCashier, to: toConfirmSucceed},
  {name: cashierPayFailed, from: [toConfirmSucceed, updatedByApplicant], to: payFailed},

  {name: applicantUpdate, from: payFailed, to: updatedByApplicant},

  {name: cashierPaySucceed, from: [toConfirmSucceed, updatedByApplicant], to: paySucceed},

  {name: abandon, from: [toSubmit, refusedByManager, refusedByCashier, refusedByFinance, refusedByChief], to: abandoned},  //流程结束
  {name: 'goto', from: '*', to: function(s) { return s } }
]

const OrderMachine = StateMachine.factory({
  transitions,

  data: ($order, user, args = {}, t) => {
    if (!user) throw new Error('请登录')
    return {$order, user, args, t}
  },

  methods: {
    init () {
      this.goto(this.$order.approStatus)
      return this
    },

    /** 初始操作 */
    onBeforeTransition,

    /** Payment 类别的财务审批通过 **/
    onCashierAppro,

    /** Oversea 类别的财务审批通过 **/
    onCashierApproToIC,

    /** 付款 order */
    onCashierPay,

    /** 确认付款完成 order */
    onCashierPaySucceed

  }
});

exports.OrderMachine = OrderMachine
exports.OrderTransitions = transitions
