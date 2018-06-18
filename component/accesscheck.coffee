WebError = require('web-error').default
models  = require('../models').models
sequelize  = require('../models').sequelize
Sequelize  = require('../models').Sequelize
RBAC = require('rbac').default
temprbac={}
rbacGrant = {}

exports.buildPermission=(cb)->
    models.role.findAll().then((roles)->
        models.permission.findAll({where:{status:1}}).then((permissions)->
            models.grant.findAll({where:{status:1}}).then((grants)->
                rs=[]
                ps={}
                gs={}
                rs.push(r.id) for r in roles

                for p in permissions
                    ps[p.object] = [] if not ps[p.object]?
                    ps[p.object].push(p.operation)
                for g in grants
                    gs[g.roleId] = [] if not gs[g.roleId]?
                    if g.targetroleId?
                        permissionstr=g.targetroleId
                    else
                      for pp in permissions
                        if pp.id == g.targetpermissionId
                            permissionstr="#{pp.operation}_#{pp.object}"
                    gs[g.roleId].push(permissionstr)
                rbacr={
                    roles: rs,
                    permissions: ps,
                    grants: gs
                }
                rbacGrant = rbacr;

                temprbac = new RBAC(rbacr, (err, rbacInstance) ->
                  if (err)
                    throw err
                  else
                      temprbac=rbacInstance
                      cb(rbacInstance)
                )
            )
        )
    )


exports.rbac=()->
    temprbac

exports.rbacGrant = ()->
    rbacGrant
#
#Return middleware function for permission check
#@param  {RBAC}    rbac              Instance of RBAC
#@param  {String}  action            Name of action
#@param  {String}  resource          Name of resource
#@param  {String}  redirect          Url where is user redirected when he has no permissions
#@param  {Number}  redirectStatus    Status code of redirect action
#@return {Function}                  Middleware function
#
exports.can = (rbac, action, resource, redirect, redirectStatus) ->
    redirectStatus = redirectStatus || 302
    (req, res, next) ->
        if(!req.user)
            return res.json({
                status: 'failed',
                msg: '请重新登录',
                code: 104
            })
        if(req.user.roles.length>0)
            error = ''
            flag = false
            for role,i in req.user.roles
                rbac.can(role.id, action, resource, (err, can) ->
                    if(err)
                        error = err
                    else if(can)
                        flag = true
                )
            if (error)
                return next(error)
            else if (flag)
                return next()
            else
                if (redirect)
                    return res.redirect(redirectStatus, redirect)
                else
                    console.log(new Error('没有权限'))
                    return res.json({
                        status: 'failed',
                        msg: '没有权限',
                        code: 120
                    })
        else
            console.log(new Error('没有权限'))
            return res.json({
                status: 'failed',
                msg: '没有权限',
                code: 120
            })
#
#Return middleware function for permission check
#@param  {RBAC}  rbac                Instance of RBAC
#@param  {String}  name              Name of role
#@param  {String}  redirect          Url where is user redirected when he has no permissions
#@param  {Number}  redirectStatus    Status code of redirect action
#@return {Function}                  Middleware function
#
exports.hasRole = (rbac, name, redirect, redirectStatus) ->
    redirectStatus = redirectStatus || 302

    (req, res, next) ->
        if(!req.user)
            return next(new WebError(401))

        for role,i in req.user.roles
            rbac.hasRole(role.id, name, (err, has) ->
                if(err)
                    return next(err)
                else if(has)
                    return next()
                else if(i>=req.user.roles.length-1)
                    if(redirect)
                        return res.redirect(redirectStatus, redirect)
                    else
                        return next(new WebError(401))
            )
        return next(new WebError(401))
