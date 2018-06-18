common = require('./common')
config = require('../config')
passport = require('./passport')
moment= require('moment')
validator= require('validator')
appconfig = require("./appcfg")
util = require("./util")
uploadcom = require("./../component/upload")
models  = require('../models').models

dl=require("debug")('eventcom:log')
de=require("debug")('eventcom:error')
#新建用户
exports.create=(req,res,account,person,cb)->
  tperson={}
  if(util.isFunction(person))
    cb=person
  else
    tperson=person
#  if((account.exunionid? or account.openid?) and not account.username?)
#    wxid= account.exunionid||account.openid
#    account.username="wxu_#{moment().format('YYMMDDHHmmss')}#{wxid.slice(wxid.length-4,wxid.length)}"
#    account.password="#{account.username}#{Math.random().toString().slice(2,6)}"
#    account.type=1
#  else if(account.username? )
#    if(account.checkmobilecode.toString() == req.session.checkmobilecode.toString())
#    else
#      #验证码错误
#      return cb(9)
  if account.password?
    account.password = util.computepassword(account.password)
  else
    #未输入密码
    return cb(10)
  passport.checkusername(req, res, account, (err,accountobj)->
    if err
      cb(err,{user: accountobj})
      return
#    if(account.type==1)
#      account.hasobject=true
    models.account.create(account).then((account)->
      dl(account)
      cb(null,{user: account})
    ).catch(common.catchsendcode(req,res))
    )
#
#exports.createdefaultperson=(req,accountid,person,cb)->
#  headpic=null
#  if typeof person=='String'
#    name=person
#  else
#    name=person.name
#  saveperson=()->
#    person={account_id:accountid,headpic:headpic,name:name,status:2}
#    if validator.isMobilePhone(name,'zh-CN')
#      person.mobile=name
#    req.models.person.create(person, common.ormerrhandler(null, null, true, (err,pr)->
#        cb(null,pr)
#      )
#    )
#  if person.headpic? and person.headpic.startWith('http://')
#    uploadcom.uploadfile(req,{type:1,imgurls:[person.headpic]},(err,imgids)->
#      if imgids? and imgids.path? and imgids.path.length>0
#        headpic=imgids.path[0]
#        saveperson()
#      else
#        saveperson()
#    )
#  else
#    saveperson()
