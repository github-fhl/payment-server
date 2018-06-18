(function() {
  var RBAC, Sequelize, WebError, models, rbacGrant, sequelize, temprbac;

  WebError = require('web-error').default;

  models = require('../models').models;

  sequelize = require('../models').sequelize;

  Sequelize = require('../models').Sequelize;

  RBAC = require('rbac').default;

  temprbac = {};

  rbacGrant = {};

  exports.buildPermission = function(cb) {
    return models.role.findAll().then(function(roles) {
      return models.permission.findAll({
        where: {
          status: 1
        }
      }).then(function(permissions) {
        return models.grant.findAll({
          where: {
            status: 1
          }
        }).then(function(grants) {
          var g, gs, j, k, l, len, len1, len2, len3, m, p, permissionstr, pp, ps, r, rbacr, rs;
          rs = [];
          ps = {};
          gs = {};
          for (j = 0, len = roles.length; j < len; j++) {
            r = roles[j];
            rs.push(r.id);
          }
          for (k = 0, len1 = permissions.length; k < len1; k++) {
            p = permissions[k];
            if (ps[p.object] == null) {
              ps[p.object] = [];
            }
            ps[p.object].push(p.operation);
          }
          for (l = 0, len2 = grants.length; l < len2; l++) {
            g = grants[l];
            if (gs[g.roleId] == null) {
              gs[g.roleId] = [];
            }
            if (g.targetroleId != null) {
              permissionstr = g.targetroleId;
            } else {
              for (m = 0, len3 = permissions.length; m < len3; m++) {
                pp = permissions[m];
                if (pp.id === g.targetpermissionId) {
                  permissionstr = `${pp.operation}_${pp.object}`;
                }
              }
            }
            gs[g.roleId].push(permissionstr);
          }
          rbacr = {
            roles: rs,
            permissions: ps,
            grants: gs
          };
          rbacGrant = rbacr;
          return temprbac = new RBAC(rbacr, function(err, rbacInstance) {
            if (err) {
              throw err;
            } else {
              temprbac = rbacInstance;
              return cb(rbacInstance);
            }
          });
        });
      });
    });
  };

  exports.rbac = function() {
    return temprbac;
  };

  exports.rbacGrant = function() {
    return rbacGrant;
  };

  
  //Return middleware function for permission check
  //@param  {RBAC}    rbac              Instance of RBAC
  //@param  {String}  action            Name of action
  //@param  {String}  resource          Name of resource
  //@param  {String}  redirect          Url where is user redirected when he has no permissions
  //@param  {Number}  redirectStatus    Status code of redirect action
  //@return {Function}                  Middleware function

  exports.can = function(rbac, action, resource, redirect, redirectStatus) {
    redirectStatus = redirectStatus || 302;
    return function(req, res, next) {
      var error, flag, i, j, len, ref, role;
      if (!req.user) {
        return res.json({
          status: 'failed',
          msg: '请重新登录',
          code: 104
        });
      }
      if (req.user.roles.length > 0) {
        error = '';
        flag = false;
        ref = req.user.roles;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          role = ref[i];
          rbac.can(role.id, action, resource, function(err, can) {
            if (err) {
              return error = err;
            } else if (can) {
              return flag = true;
            }
          });
        }
        if (error) {
          return next(error);
        } else if (flag) {
          return next();
        } else {
          if (redirect) {
            return res.redirect(redirectStatus, redirect);
          } else {
            console.log(new Error('没有权限'));
            return res.json({
              status: 'failed',
              msg: '没有权限',
              code: 120
            });
          }
        }
      } else {
        console.log(new Error('没有权限'));
        return res.json({
          status: 'failed',
          msg: '没有权限',
          code: 120
        });
      }
    };
  };

  
  //Return middleware function for permission check
  //@param  {RBAC}  rbac                Instance of RBAC
  //@param  {String}  name              Name of role
  //@param  {String}  redirect          Url where is user redirected when he has no permissions
  //@param  {Number}  redirectStatus    Status code of redirect action
  //@return {Function}                  Middleware function

  exports.hasRole = function(rbac, name, redirect, redirectStatus) {
    redirectStatus = redirectStatus || 302;
    return function(req, res, next) {
      var i, j, len, ref, role;
      if (!req.user) {
        return next(new WebError(401));
      }
      ref = req.user.roles;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        role = ref[i];
        rbac.hasRole(role.id, name, function(err, has) {
          if (err) {
            return next(err);
          } else if (has) {
            return next();
          } else if (i >= req.user.roles.length - 1) {
            if (redirect) {
              return res.redirect(redirectStatus, redirect);
            } else {
              return next(new WebError(401));
            }
          }
        });
      }
      return next(new WebError(401));
    };
  };

}).call(this);
