common=require('./common')
util=require('./util')
routes=require('./../routes/index')
dl=require("debug")('passport:log')
de=require("debug")('passport:error')
config=require('config')
models = require('../models').models
rbac=require('../component/accesscheck').rbac
ldap = require('../routes/ldap')
testCfg = require('../test/config.test')
#从session里拿到本人信息，并判断查找的内容是否是本人的内容
#operaterule:
# 0=req.user.id
# 1=req.person.id
# 2=req.sponsor.id


exports.validateruleopration=(req,res,obj,operaterule=[0,1,2])->
  operatecondition={}
  result=false
  if operaterule.in_array(0)
    if req.user
      operatecondition.account_id = req.user.id
    else
      result= result ||req.isadmin
  if operaterule.in_array(1)
    if req.session.person
      operatecondition.person_id = req.session.person.id
    else
      result= result ||req.isadmin
  if operaterule.in_array(2)
    if req.session.sponsors and req.session.sponsors.length>0
      operatecondition.sponsor_id=[]
      operatecondition.sponsor_id.push s.id for s in req.session.sponsors
    else
      result= result ||req.isadmin
  if not util.isArray(obj)
    obj=[obj]
  result=true
  for o in obj
    temp=exports.validatedataopration(req,o,operatecondition)
    result=result and temp
  return result
#确认是否类型是否为4，或者obj==operatecondition
exports.validatedataopration=(req,obj,operatecondition)->
  if(req.exadmin and req.isadmin)
    if(obj and obj.length!=0)
      return true
    else
      return false
  else
    result=util.compare_option(obj,operatecondition)
    if(result and result.length!=0)
      return true
    else
      return false

exports.getOwnObject=(req,res,model,findcondition,operaterule=[0,1,2],cb,errorcode=1)->
  exports.getOperateObject(req,res,model,findcondition,{},(err,result)->
    if exports.validateruleopration(req,res,result,operaterule)
      cb(null,result)
    else
      if res?
        common.ressenderror(req,res,errorcode)
      else
        cb(errorcode)
  ,errorcode)
#
exports.getOperateObject=(req,res,model,findcondition,operatecondition,cb,errorcode=1)->
  orderby=[]
  if findcondition.orderbystr?
    orderby = [findcondition.orderbystr]
    delete findcondition.orderbystr
  model.find(findcondition,orderby,{cache:false},(err,obj)->
    if(err)
      console.log(err)
      common.ressenderror(req,res)
    else if obj.length==0
      if errorcode==false
        cb(null,obj)
      else
        common.ressenderror(req,res,errorcode)
    else
      if exports.validatedataopration(req,obj,operatecondition)
        cb(null,obj)
      else
        common.ressenderror(req,res,errorcode)
  )

exports.canAccess=(accesstypearr,req)->
  user=req.user
  #  req.accesstypearr=accesstypearr
  accesstype=-1
  accesstype=req.user.accesstype if req.user
  result=2
  minpersonpermission=99
  minsponsorpermission=99
  minadminpermission=99
#  for at in accesstypearr
#    if 1<=at<2 and at <minpersonpermission
#      minpersonpermission=at
#    if 2<=at<3 and at <minsponsorpermission
#      minsponsorpermission=at
#    if 4<=at<5 and at <minadminpermission
#      minadminpermission=at
  if 0 in accesstypearr or accesstype in accesstypearr
    result=true
  else
    for at in accesstypearr
      if accesstype>=at>=Math.floor(accesstype)
        result=true
        break
    if result==2
      if req.isperson and minpersonpermission!=99
        if not req.session.person? or req.session.person.status==2
          result=105
      if req.issponsor and minsponsorpermission!=99
        sstatus=false
        scheckstatus=false

        for sponsor in req.session.sponsors
          if minsponsorpermission>=2.1
            if sponsor.status==1
              sstatus=true
              break
          else if minsponsorpermission==2.2
            if sponsor.checkstatus==1
              scheckstatus=true
              break
        if sstatus==false
          result=62
        else if scheckstatus==false
          result=63

  return result

#accesstypearr=[0,1]
#0=本人，1=个人用户，2=组织，4=admin
exports.ensureAuthenticated=(accesstypearr)=>
  (req, res, next)->
    if 4 in accesstypearr
      req.exadmin=true
    if req.isAuthenticated()
      req.isadmin=req.user.type==4
      req.isperson=req.user.type==1
      req.issponsor=req.user.type==2
      req.user.accesstype=req.user.type
      switch req.user.type
        when 1
          if req.session.person? and req.session.person.status==1
            req.user.accesstype=1.1
        when 2
          if req.session.sponsors and req.session.sponsors.length>0
            for sponsor in req.session.sponsors
              if sponsor.status==1
                req.user.accesstype=2.1 if 2<=req.user.accesstype<2.1
              if sponsor.checkstatus==1
                req.user.accesstype=2.2
                break
        when 4
          if req.user.status==1
            req.user.accesstype=4.1
    console.log("isAuthenticated "+req.isAuthenticated())
    accesscode=exports.canAccess(accesstypearr,req)
    if (accesscode.toString()=='true')
      return next()
    else
      if config.loginpage
        common.gologin(req,res,accesscode)
      else
        common.ressenderror(req,res,accesscode)

exports.finduser=(req,id, done) ->
  models.account.findOne({where:{id:id},include: [{
    model: models.role,
  }]}).then((result) ->

    console.log('result: ',result)

    account=if result? then result else null

    if account?
      exports.getScope(account,(account)->
        done(null, account)
      )
    else
      done(null, account)
  )
#新建account
exports.setupaccount=(req,account,done)->
  req.user=account

  olddeviceid=account.deviceid
  common.getreqparameter(req,null,account,'deviceid',null,false)
  newdeviceid=account.deviceid
  account.lastlogintime=new Date()


  setaccountobj=(account,done)->
    switch account.type
      when 1
        account.getPerson(common.ormerrhandler(req,null,false,(err,person)->

            if person
              if person.length>0
                req.session.person=person[0]
                account.person=person[0]
              else
                req.session.person=person
                account.person=person
            return done(null, account)
          )
        )
      when 2
        account.sponsors=account.getSponsors(common.ormerrhandler(req,null,false,(err,sponsor)->
            if sponsor and sponsor.length>0
              added=0
              account.sponsors=sponsor
              for s in account.sponsors
                s.getFinance((err, obj)->
                  if obj
                    sfinance = obj
                  else
                    sfinance = common.createdefaultfinance()
                  s.finance=sfinance
                  added++
                  if added == account.sponsors.length
                    req.session.sponsors=account.sponsors
                    return done(null, account)
                )
            else
              return done(null, account)
          )
        )
      when 4
        return done(null, account)

  if account.deviceid
    account.accountkey=util.computepassword(account.password+account.id+account.deviceid+config.accountsalt+(new Date()).valueOf())
  if olddeviceid!=newdeviceid
    account.devicetoken=null
    models.devicetoken.findOne({where:{deviceid:newdeviceid,usertype:account.type}}).then((obj1)->
      console.log(err1)
      if obj1 and obj1.length>0
        account.devicetoken=obj1[0].token
        account.devicetype=obj1[0].devicetype
      account.save()
      setaccountobj(account,done)
    )
  else
    account.save()
    setaccountobj(account,done)

  return
exports.login = (req,username, password, done) ->
  type=req.param('type')
  openid=req.param('openid')
  state=req.param('state')
  accountkey=req.param('accountkey')
  deviceid=req.param('deviceid')
  dl("state is #{req.session.wechatstate} :  #{state}")
  req.session.person=null
  req.session.sponsors=null

  # 正式上线后删除这个判断
  checkUser = (cb)->
    idArr = []
    for key,value of testCfg.roles
      idArr.push(value.id)
    idArr = idArr.concat(['superMan', 'A_manager_B', 'A_general'])
#    if config.test and username in idArr
    if username in idArr
      cb()
    else
      ldapusername = 'ap\\' + username

      ldap.getLdapInfo('', ldapusername, password, 'login').then((result) ->
        return done(null, false, {message: '105'}) if not result
        cb()
      ).catch((err) ->
        console.log('err: ', err);
        return done(null, false, { message: '101'})
      )

  checkUser(()->
    if username?
      models.account.findOne({
        where: {id: username, status: 1}, include: [{
          model: models.role,
        }]
      }).then((result)->
        account = result
        if not account?
          return done(null, false, {message: '103'})

        exports.getScope(account,(account)->
          req.user = account
          return done(null, account)
        )
      )
    else
      return done(null, false, { message: '102'})
  )


exports.getScope=(account,cb)->
  account.dataValues.scopes=[]
  for r,i in account.roles
    rbac().getScope(r.id,(err,scope)->
      account.dataValues.scopes=account.dataValues.scopes.concat(scope)
    )
  cb(account)
#检验用户名
exports.checkusername=(req,res,account,cb,autoreturnerr=true)->
  models.account.findOne({where: {username: account.username}}).then((obj)->
#    if err
#      if autoreturnerr
#        common.ressenderror(req,res,0)
#      else
#        #0内部错误
#        cb(0)
#    else
#    console.log(obj)
    if obj?
      if autoreturnerr
        common.ressenderror(req, res, 14)
      else
        cb(14,obj[0])
    else
      cb()
  ).catch(common.catchsendcode(req,res,0))

#判断did是否在uid的范围内
exports.canopreate=(req,res,did,uid,errcode=2)->
  if (req.isadmin) or (did==uid) or (util.isArray(uid) and did in uid)
    return true
  else
    if errcode
      common.ressenderror(req, res, errcode)
    return false
exports.operatecondition=(req,ps)->
  result={}
  if req.isadmin
  else
    for k,p of ps
      if p.indexOf('@')==0
        p=p.replace('@','')
        result[k]=eval(p)
  result
