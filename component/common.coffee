crypto = require('crypto')
dl = require('debug')('common:log')
de = require('debug')('common:error')
config = require('config')
uuid = require('uuid')
moment = require('moment')
util = require('./util')
validator = require('validator')
appcfg = require('./appcfg')
nodeExcel = require('excel-export')
DeepAssign = require('deep-assign')
clone = require('clone')
models  = require('../models').models
sequelize  = require('../models').sequelize
Sequelize  = require('../models').Sequelize
common=require("./../component/common")
getName = require('./fn').getName

exports.errors = {
  #0-100 通用错误
  0: '内部错误'
  1: '命名重复'
  2: '该数据已被删除，无法再次删除'
  3: '该数据不存在'
  4: '您没有该权限，您没有角色'
  5: '数据格式不正确'
  6: '请填写该字段'
  7: '当前数据出错'
  8: '没有填写对应的 id'
  9: '该 detail 数据不属于主数据'
  10: '该字段有重复'
  11: '您没有该权限'

  #101-200 账户相关错误
  101: '登录失败'
  102: '请填写用户名'
  103: '用户不存在'
  104: '请重新登录'
  105: '登录 ldap 失败'
  106: '账户名存在重复'
  107: '该账户已有该角色'
  108: '该分机号已存在'
  109: '对应人员需要拥有主管角色'
  110: '您没有对应的部门主管（总监）人员，请联系管理人员进行添加'
  111: '该用户存在但已被删除，无法重新创建'

  120: '没有权限',

  #201-300 申请单错误
  201: '请填写正确的payeeType'
  202: '员工付款类别必须填写 money、 bankNum、 bankName、 payDate、 paytypeId、 vendorName、 reimuserId、 payeeType 字段，现缺少'
  203: '供应商付款类别必须填写 money、 bankNum、 bankName、 paytypeId、 vendorName、 payeeType 字段，现缺少'
  204: '该员工该月该类型没有报销额度'
  205: '您没有权限查看该申请单'
  206: '借贷请相等'
  207: '只有付款完成的申请单才能拆分科目'
  208: '报销金额超出预算'
  209: 'company 类型的申请单对应的 vendor 必须全部相同'
  210: 'order 只能拥有一种 paytype'
  211: '该申请单已废弃'
  212: '当前状态不能更新申请单'
  213: '该类别的成本中心不能为'
  214: '该类别的成本中心只能为'
  215: '账号有重复'
  216: '请填写该科目的银行代号'
  217: '请填写该科目的银行账户类别'
  218: '金额细则有重复'
  219: '申请单描述有重复'
  220: '申请单已进行凭证制单，无法修改'

  #301-500 申请审批流程错误
  301: '您不是该申请单的创建人员，无法操作该申请单'
  302: '请填写对应的主管'
  303: '员工缺少权限'
  304: '没有对应的申请log，请检查数据库'
  305: '申请单的当前状态无法执行此操作'
  306: '申请单的申请审批人员与当前人员不一致'
  307: '请填写对应的拒绝原因且只能拒绝一个申请单'
  308: '该操作不能批量操作'
  309: '请选择对应的银行科目'
  310: '请填写对应的 paidNo'
  311: '请填写对应的付款时间'
  312: '请检查付款单号的流水号是否漏号跳号'
  313: '请选择银行类别的科目'
  314: '该申请单的付款单号的公司代号错误'
  315: '该申请单的付款单号的账户类别错误'
  316: '该申请单的付款单号的银行代号错误'

  #501-1000 系统设置错误
  501: '新建/更新 的报销额度开始有效期不能早于当前时间'
  502: '新建的报销额度对应的有效期存在相同'
  503: '当前已生效的报销额度的生效期无法修改'
  504: '该付款对象已被撤销'
  505: '最多只能填写两个报销额度'
  506: '该字段必须一致'
  507: '至少填写一条 vendor 详情'
  508: '不能编辑该默认成本中心'
  509: '不能使用该名称'

  #1001-1100 打印错误
  1001: '只能打印 company 类型的 order'
  1002: '该 order 没有 orderdetail'
  1003: '该员工没有签名，请联系系统管理员'
  1004: '该申请单还没有进行科目拆分'
}
# 返回错误信息
exports.ressenderror = (req, res, errorcode = 0, error)->
  addmsg=""
  if not isNaN(errorcode)
    addmsg= if error? then "--#{error}" else ""
    error = exports.errors[errorcode]

  else
    error = errorcode
    errorcode = 0
  if util.isFunction(res)
    err = new Error(errorcode)
    err.status = errorcode
    res(err)
  else if res.json
    if not res.finished and  not res.sent
      res.json({status: 'failed', msg: "#{error}#{addmsg}", code: errorcode})
      res.sent=true

exports.gologin = (req, res)->
  backurl=req.url
  res.redirect("#{config.loginpage}?backurl=#{backurl}")

exports.catchsendcode=(req,res,code)->
  (err)->
    console.log(err)
    exports.ressenderror(req,res,code)

#=>启用闭包，作用是变量作用到函数内部,checjhasvalue 检测是否有errcode，返回错误信息
exports.ormerrhandler = (req, res, checkhasvalue, next)=>
  (err, obj)->
    errorcode = 1
    if util.isFunction(checkhasvalue)
      next = checkhasvalue
      checkhasvalue = false
    else if validator.isNumeric(checkhasvalue)
      errorcode = checkhasvalue
      checkhasvalue = true

    if err
      de(err)
      console.log(err)
      error=true
    else if checkhasvalue
      if obj? and ((obj.constructor == Array and obj.length > 0) or (obj.constructor != Array and obj != null) )
        if obj.objs?
          if(not obj.
          objs.length>0)
            error=true
      else
        error=true
    if error
      if res?
        exports.ressenderror(req, res,errorcode)
      else
        next(errorcode)
    else
      next(null,obj)

exports.resrender = (req, res,view, obj=null)->
#  res=staticobj.res
  args={}
#  exports.getreqboolparameter(req,res,args,'json',false,false)
  if not res.finished and not res.sent
    if config.renderjson and args.json
      res.json(obj)
      res.sent=true
    else
      res.render(view,obj)
      res.sent=true

#将对象转换为json格式的数据，切添加status = success sent = true，返回正确的json数据
exports.ressendsuccess = (req, res, obj)->
  result = {status: 'success'}
  if obj
    result = DeepAssign(obj, {status: 'success'})
    result = util.remove_empty(clone(result))
  if not res.finished and not res.sent
    res.json(result)
    res.sent=true

exports.getadminreqparameter = (req, res, obj, pn, name, require, defaultvalue = null)->
  params=exports.convertgetreqparam(obj, pn, name, require, defaultvalue)
  if req.isadmin
    exports.getreqparameter(req, res, params.obj, params.pn,params. name, params.require, params.defaultvalue)
  else
    false
#返回整形参数
exports.getreqintparameter = (req, res, obj, pn, name, require, defaultvalue = null)->
  params=exports.convertgetreqparam(obj, pn, name, require, defaultvalue)
  result=exports.getreqparameter(req, res, params.obj, params.pn,params.name, params.require, params.defaultvalue)
  if result
    if validator.isInt(params.obj[params.pn])
      params.obj[params.pn] = util.str2int(params.obj[params.pn])
    else if validator.isInt(params.defaultvalue)
      params.obj[params.pn] = params.defaultvalue
    else if params.require
      result=false
  result
exports.getreqfloatparameter = (req, res, obj, pn, name, require, defaultvalue = null)->
  params=exports.convertgetreqparam(obj, pn, name, require, defaultvalue)
  result=exports.getreqparameter(req, res, params.obj, params.pn,params. name, params.require, params.defaultvalue)
  if result
    if validator.isFloat(params.obj[params.pn])
      params.obj[params.pn] = util.str2float(params.obj[params.pn])
    else if validator.isFloat(params.defaultvalue)
      params.obj[params.pn] = params.defaultvalue
    else if params.require
      result=false
  result

exports.getreqboolparameter = (req, res, obj, pn, name, require, defaultvalue = null)->
  params=exports.convertgetreqparam(obj, pn, name, require, defaultvalue)
  result=exports.getreqparameter(req, res, params.obj, params.pn,params. name, params.require, params.defaultvalue)
  if result
    if validator.isBoolean(params.obj[params.pn])
      params.obj[params.pn] = util.str2bool(params.obj[params.pn])
    else if validator.isBoolean(params.defaultvalue)
      params.obj[params.pn] = params.defaultvalue
    else if params.require
      result=false
  result
#检测req参数中是否有pn,有则把pn的值赋值给params.obj[pn]
exports.getreqparameter = (req, res, obj, pn, name, require, defaultvalue = null)->
#  req=staticobj.req
  params=exports.convertgetreqparam(obj, pn, name, require, defaultvalue)
#  console.log("#{params.name}: ",req.param(params.name))
#  console.log("#{params.name}: ",typeof req.param(params.name))

  if req.param(params.name)?
#    dl(req.param(name))
    params.obj[params.pn] = req.param(params.name)
    #当传值为空字符串时，将其值转变为null
    #如果默认值为空字符串，则不转变
    if params.obj[params.pn]=='' and params.defaultvalue!=''
      params.obj[params.pn] = null
    return true
  else
    if params.require
#      res=staticobj.res
      de("缺少必需的数据-#{params.name}")
      if typeof params.require == 'number'
        exports.ressenderror(req, res, params.require)
      else
        exports.ressenderror(req, res, "缺少必需的数据-#{params.name}")
      false
    else

      if params.defaultvalue? and not params.obj[params.pn]?
        params.obj[params.pn] = params.defaultvalue
      true

#name是可选参数,如果为空将name设置为pn
exports.convertgetreqparam=(obj, pn, name, require, defaultvalue)->
#  req=staticobj.req
  result={obj:obj, pn:pn, name:name, require:require, defaultvalue:defaultvalue}
  if typeof name == 'boolean' or typeof name == 'number'

    result.defaultvalue = require
    result.require = name
    result.name = null

  if typeof result.name == 'undefined' or result.name == null
    result.name = pn
  result
#如果用户不为空，使用newname代替name
exports.changereqparametername = (req, name,newname, defaultvalue = null)->
  parambody=exports.getreqparameterobj(req, name)
  util.changeobjkey(parambody,name,newname)

#获取访问的用户？
exports.getreqparameterobj = (req, name, defaultvalue = null)->
  if req.body[name]
    req.body
  else if req.query[name]
    req.query
  else if req.params[name]
    req.params
  else if defaultvalue
    req.body[name]=defaultvalue
    req.body
#orm 的findlist通过req的参数获取model的list，自己包装
exports.setormquery=(req,value)->
  req.ormquery={} if not req.ormquery?
  util.merge_options(req.ormquery,value)
exports.findlistfromreq = (req,res,model)->
  args = {}
  tempcondiftion = {}
  args.where = tempcondiftion
  commonparams = ['limit','skip','orderby','desc','columnonly','wherestring']
  exports.getreqparameter(req, res, args, 'limit', null, false)
  exports.getreqparameter(req, res, args, 'skip', null, false, 0)
  exports.getreqparameter(req, res, args, 'orderby', null, false, 'createdAt')
  exports.getreqparameter(req, res, args, 'desc', null, false, 0)
  exports.getreqparameter(req, res, args, 'include', null, false)    #传入有对应关系的数据库名
  #  exports.getreqparameter(req, res, args, 'columnonly', false)
  if req.ormquery?
    args.columnonly=req.ormquery.columnonly  if req.ormquery.columnonly?
    args.wherestring=req.ormquery.wherestring if req.ormquery.wherestring?
  for key of req.params
    exports.getreqparameter(req, res, tempcondiftion, key, false, ) if key not in commonparams
  for key of req.query
    exports.getreqparameter(req, res, tempcondiftion, key, false) if key not in commonparams
  for key of req.body
    exports.getreqparameter(req, res, tempcondiftion, key, false)  if key not in commonparams
  ormcondition={}
  ormcondition=exports.buildormcondition(model,args)
  dl('ormcondition')
  dl(ormcondition)

  if ormcondition.wherestring?
    ormcondition.where=[ormcondition.wherestring.querystr,ormcondition.wherestring.queryvalue]

  if ormcondition.include?
    includeArr=ormcondition.include.split(',')
    ormcondition.include=[]
    includeArr.forEach((item)->
      ormcondition.include.push({
        model:models[item]
        required: false
      })
    )
  ormcondition.attributes=ormcondition.only if ormcondition.only.length>0

  ormcondition

#返回orm的condition
exports.buildormcondition = (models,obj)->
  modelproperties=[]
  modelproperties=(models.attributes[p].fieldName for p of models.attributes)
  result = {order: [], where: {}, only: []}

  if obj.where?
    for key of obj.where
      where=this.str2ormparam(key, obj.where[key])
      for key2 of where
        delete where[key2] if key2 not in  modelproperties


        result.where=util.merge_options(result.where, where)
  obj.where=result.where
  dl(result)
  result=util.merge_options(result, obj)
  if result.orderby? and typeof result.orderby=="string"
    result.orderby=result.orderby.split(',')
  else
    result.orderby=[result.orderby]
  if result.desc? and typeof result.desc=="string"
    result.desc=result.desc.split(',')
  else
    result.desc=[result.desc]
  if(util.isArray(result.orderby))
    for i in [0..result.orderby.length-1]
      desc=result.desc[i]
      if desc? and typeof desc != 'undefined' and util.str2bool(desc)
        desc = 'DESC'
      else
        desc = 'ASC'
      result.order.push([result.orderby[i],desc]) if result.orderby[i] in modelproperties
  if(util.isArray(result.columnonly))
    for c in result.columnonly
      if c in modelproperties
        result.only.push(c)

  return result

#通过参数后缀获取查询条件,以以下字符结尾表示的意思为
#[column]_from： column>=
#[column]_to： column<=
#[column]_array： column in ()
#[column]_like： column like '%value%'
#[column]_between： column between ('%value1%','%value2%') 以逗号分隔的2个值

exports.str2ormparam = (str, value)->
 # gt: 6,                #> 6
 # gte: 6,               #>= 6
 # lt: 10,               #< 10
 # lte: 10,              #<= 10
 # ne: 20,               #!= 20
 # not: true,            #IS NOT TRUE
 # between: [6, 10],     #BETWEEN 6 AND 10
 # notBetween: [11, 15], #NOT BETWEEN 11 AND 15
 # in: [1, 2],           #IN [1, 2]
 # notIn: [1, 2],        #NOT IN [1, 2]
 # like: '%hat',         #LIKE '%hat'
 # notLike: '%hat'       #NOT LIKE '%hat'
  operations = [
    {opertaion:'gt',arrayvalue:0,arraymin:0},
    {opertaion:'gte',arrayvalue:0,arraymin:0},
    {opertaion:'lt',arrayvalue:0,arraymin:0},
    {opertaion:'lte',arrayvalue:0,arraymin:0},
    {opertaion:'ne',arrayvalue:0,arraymin:0},
    {opertaion:'not',arrayvalue:0,arraymin:0},
    {opertaion:'between',arrayvalue:1,arraymin:2},
    {opertaion:'notBetween',arrayvalue:1,arraymin:2},
    {opertaion:'in',arrayvalue:1,arraymin:1},
    {opertaion:'notIn',arrayvalue:1,arraymin:1},
    {opertaion:'like',arrayvalue:0,arraymin:0,prefix:'%',suffix:'%'},
    {opertaion:'notLike',arrayvalue:0,arraymin:0,prefix:'%',suffix:'%'}
  ]
  result = {}
  name = str
  if(value?)
    for op in operations
      if(util.endWith(str, "_#{op.opertaion}"))

        name = str.substring(0, str.lastIndexOf("_#{op.opertaion}"))
        if(op.arrayvalue)
          value = value.split(',') if typeof value == 'string'
          if value.length < op.arraymin
            value = null
        else
          value="#{op.prefix||''}#{value}#{op.suffix||''}"
        if value?
          nv={}
          nv["$#{op.opertaion}"]=value
          value=nv
        break

    result[name] = value  if value?

  return result
#初始化amount信息
exports.createdefaultfinance=()->
  {totalamount:0,availableamount:0,currentavailableamount:0,amount:0,freezeamount:0,withdrawamount:0}
#导出excel文件
exports.exportexcel=(req,res,cols,rows,filename='Report')->
  conf ={}
  conf.cols =cols
  conf.rows = rows
  result = nodeExcel.execute(conf);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader("Content-Disposition", "attachment; filename=#{filename}.xlsx");
  res.end(result, 'binary');


# todo 可能的上传图片 活动简介，组织简介，门票简介，门票退票

#req.models.task.create({actiontype:21,target:"{accounttype:2,users:['#{app.store_id}']}",desc:appconfig.pushappmsgtemplate(2,'',job.name,req.session.person.name)},()->)
#req.models.task.create({actiontype:21,target:"{accounttype:1,users:['#{users.join('\',\'')}']}",desc:appconfig.pushappmsgtemplate(newstatus,storename,job.name,person.name)},()->)
exports.pushappmsgtemplate=(status,arg=[])->
  if not isNaN(status)
    status=parseInt(status)
  switch status
    when 1
      m=moment(arg[1])
      m.local()
      "【活动即将开始】您报名的活动《#{arg[0]}》将于#{m.format('MM月DD日hh时mm分')}开始，敬请留意。"
      
exports.initialsyscode=()->
  codestatus=appcfg.status
  for i,j of codestatus
    for j of codestatus[i]
      argument={
        companyId:'dd5ce810-73e4-11e6-a84b-7f25edbf2fdc',
        type:j,
        code:codestatus[i][j].code,
        name:codestatus[i][j].name,
        sysArgumentId:i
      }
      models.argDetail.findOrCreate({
        where:{
          sysArgumentId:i,
          type:j,
        },
        defaults:argument
      }).then((args,created)->
        arg=args[0]
        codestatus[arg.dataValues.sysArgumentId][arg.dataValues.type].code=arg.dataValues.code
        codestatus[arg.dataValues.sysArgumentId][arg.dataValues.type].name=arg.dataValues.name

      )

exports.updateUsr = (req,res,obj,cb) ->
  obj.updateUsr = req.user.id
  obj.save().then((newobj) ->
    cb(null,newobj)
  ).catch((err)->
    console.log(err)
    dl(err)
    cb(53)
  )

exports.updateRlsUsr = (req,res,obj,cb) ->
  obj.rlsUsr = req.user.id
  obj.rlsDt = Date()
  obj.save().then((newobj) ->
    cb(null,newobj)
  ).catch(()->
    cb(54)
  )

exports.createUsr = (req,res,target,args,cb)->
  args.createUsr = req.user.id
  args.updateUsr = req.user.id
  target.create(args).then((newobj) ->
    console.log(newobj)
    cb(null,newobj)
  ).catch((err)->
    console.log(err)
    cb(55)
  )

#事务的批量查询，传入model的数组及对应的名称数组（查询的是所有数据）
#modelArr  需要查询的表
#attArr  需要查询的字段
exports.queryModelArr = (modelArr,data,t,attArr,whereArr)->

  #当不传入attArr时，搜索所有表的全部字段
  #当attArr中，有null元素时，代表搜索该对应表的全部字段
  if not attArr?
    attArr=[]
    for j of modelArr
      attArr.push({
        exclude:[]
      })
  else
    attArr.forEach((item)->
      if not item?
        item={
          exclude:[]
        }
    )

  #当不传入whereArr时，不添加限制条件
  #当whereArr中，有null元素时，不添加限制条件
  if not whereArr?
    whereArr=[]
    for j of modelArr
      whereArr.push({})
  else
    whereArr.forEach((item)->
      if not item?
        item={}
    )
  i=0
  query = (i,t)->
    modelname=modelArr[i].getTableName()
    orderArr = if modelname == 'salaryType' then [['orderNo','ASC']] else []
    modelArr[i].findAll({where:whereArr[i],attributes:attArr[i],transaction:t,order:orderArr}).then((objs)->
      temparr=[]
      objs.forEach((item)->
        temparr.push(item.dataValues)
      )
      if modelname=='company'
        modelname+='Name'
      else modelname+='Id'
      data[modelname]=temparr
      if i<modelArr.length-1
        query(++i,t)
    )
  query(i,t)

#检验是否能够对目标进行release、confirm等更新操作操作
#errArr传入release、confirm报错时返回的错误代码数组
exports.verifyUpdate=(modelstatus,updatestatus,errArr,cb)->
  if updatestatus==config.rlsstatus.release and modelstatus!=config.rlsstatus.origin
    return cb(errArr[0])
  else if updatestatus==config.rlsstatus.confirm and modelstatus!=config.rlsstatus.release
    return cb(errArr[1])
  else if updatestatus==config.rlsstatus.abandon and modelstatus not in [config.rlsstatus.origin,config.rlsstatus.release]
    return cb(errArr[2])
  else return cb()


#检测该ID是否重复
exports.checkRepeatId=(model,primaryKey,id)->
  obj = await model.findOne({
    where:{"#{primaryKey}":id
    status: 1
    }})
  throw new Error("1,#{primaryKey}") if obj?

#检验是否拥有权限
exports.checkPermission=(req,permission)->
  own=false
  for item in req.user.dataValues.scopes
    if permission==item
      own=true
      console.log('via permission:',permission)
      break
  return own
  
exports.conditionsearch = (req,res)->
  blank = " "
  eq = " = "
  AND = " AND"
  outer_validstr = ''
  inner_validstr = ''
  andtrim = (str)->
    str.replace(/\s+AND$/,'').trim()
  quotationed = (str)->
    '\''+str+'\''

  # --- above 准备工作----
  args={}
  if(
    common.getreqparameter(req,res,args,'conditions',null,true,null)
  )
    console.log args
    conditions = JSON.parse(args.conditions)
    innerreg = /^inner/g
    outerreg = /^outer/g
    for i of conditions
      if innerreg.test(i)
        innercondition = conditions[i]
        innermodel = i.replace(innerreg,'').trim()
      else if outerreg.test(i)
        outercondition = conditions[i]
        outermodel = i.replace(outerreg,'').trim()
      else
        throw new Error('条件格式不符合规则')
    if innermodel is 'staff' or innermodel is 'inviteodr'
      outerquerystr = "SELECT code FROM #{outermodel} WHERE"
    else
      outerquerystr = "SELECT id FROM #{outermodel} WHERE"
    innerquerystr = "SELECT * FROM #{innermodel} WHERE"
    for c of outercondition
      if outercondition[c].length = 0
        continue
      else
        outerquerystr += blank+c+eq+quotationed(outercondition[c])+AND
      outer_validstr += outercondition[c]
    outerquerystr = andtrim(outerquerystr)
    for c of innercondition
      if util.isArray(innercondition[c])
        startdt = innercondition[c][0]
        enddt = innercondition[c][1]
        if startdt.length>0
          innerquerystr += blank+c+" > "+quotationed(moment(startdt).format("YYYY-MM-DD HH:mm:ss"))+AND
        if enddt.length>0
          innerquerystr += blank+c+" < "+quotationed(moment(enddt).format("YYYY-MM-DD HH:mm:ss"))+AND
      else
        if innercondition[c].length is 0
          continue
        else
          innerquerystr += blank+c+eq+quotationed(innercondition[c])+AND
    if innermodel is 'staff' or innermodel is 'inviteodr'
      outermodel += 'code'
    else
      outermodel += 'Id'
    if outer_validstr.length > 0
      querystr = innerquerystr+blank+outermodel+blank+'IN ('+outerquerystr+')'
    else
      querystr = andtrim(innerquerystr)
    console.log querystr
    validquery = querystr.split('WHERE')
    if validquery[validquery.length-1].length is 0
      querystr = validquery[0].trim()
    sequelize.query(querystr).then((results)->
      exports.ressendsuccess(req,res,results:results[0])
    ).catch(exports.catchsendcode(req,res,601))

exports.mergeobj = (obj,second = '',third = '',others...) ->
  if not typeof obj is 'object'
    throw new Error('对象必须被传入!')
  if obj[second]?
    secondobj = obj[second].dataValues
    if secondobj[third]?
      thirdobj = obj[second][third].dataValues
      console.log others
      for attr in others
        if secondobj.hasOwnProperty(attr)
          obj[attr] = secondobj[attr]
          console.log attr,obj[attr]
        if thirdobj.hasOwnProperty(attr)
          obj[attr] = thirdobj[attr]
          console.log attr,obj[attr]
    else
      for attr in others
        if secondobj.hasOwnProperty(attr)
          obj[attr] = secondobj[attr]
    delete obj[second]
  return obj


#返回错误信息
exports.catchsendmessage=(req,res)->
  (err)->
    console.log('Error:',err)
    dl('Error:',err)
    #错误以下集中
    #1：sequelize报的错，这个类型的错误存在sql属性，根据sql属性区别；在sequelize的错误中，有的存在errors，有的不存在
    #2：代码中抛出的错误，没有sql属性
    #3：从状态机中抛出的错误，有transition属性
    if err.sql? and err.errors
      if err.errors[0]? && err.errors[0].message == 'PRIMARY must be unique'
        errArr = [1, err.errors[0].value]
      else
        errArr=if not err.errors? then [err.message] else [err.errors[0].message]
    else if err.transition?
      errArr = [305, "当前状态--#{err.from}，操作--#{err.transition}"]
    else
      errArr=err.message.split(',')
    exports.ressenderror(req,res,errArr[0],errArr[1])

exports.isExist=(arg)->
  return true if arg?
  return false


