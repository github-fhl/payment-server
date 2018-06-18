const
  {cfg, helperPath} = require('config'),
  {addUsr} = require(helperPath).common,
  {
    applicant, cashier, finance, manager, chief, InterCompany
  } = cfg.roles,
  {handled} = cfg.applyStatus

let nextHandlerRole = {
  create: applicant,
  submit: manager,
  backout: applicant,

  managerAppro: cashier,
  managerRefuse: applicant,

  cashierAppro: finance,
  cashierRefuse: applicant,
  cashierApproToIC: InterCompany,

  icAppro: finance,
  icRefuse: applicant,

  financeAppro: chief,
  financeRefuse: applicant,

  chiefAppro: cashier,
  chiefRefuse: applicant,

  cashierPay: cashier,
  cashierPayFailed: applicant,
  applicantUpdate: cashier,

  cashierPaySucceed: null,
  abandon: null,
}


/**
 * 创建新的 applyOrder
 * 1. 创建新的 applylog，其中 abandon、cashierPaySucceed、cashierPaySucceed 的 applylog 的 nextHandleStatus 为已操作
 * 2. 操作指定对象是 applicant/manager ，则需要录入对应的 toHandleUsr
 */

function getApplyLog ($order, transition, user, remark) {

  let applylog = {
    operation: transition,
    operator: user.id,
    toHandleRole: nextHandlerRole[transition],
    remark
  }

  switch (nextHandlerRole[transition]) {
    case applicant:
      applylog.toHandleUsr = $order.createdUsr
      break

    case manager:
      if ($order.money < cfg.gapMoney) {
        if (!user.managerUsr) throw new Error(`${user.name} 缺少主管`)
        applylog.toHandleUsr = user.managerUsr
      }
      else {
        if (!user.managerUsr) throw new Error(`${user.name} 缺少总监`)
        applylog.toHandleUsr = user.directorUsr
      }
      break

    case null:
      applylog.applyStatus = handled
      break
  }

  addUsr(applylog, user)

  return applylog
}

module.exports = getApplyLog
