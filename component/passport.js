(function() {
  var common, config, de, dl, ldap, models, rbac, routes, testCfg, util,
    indexOf = [].indexOf;

  common = require('./common');

  util = require('./util');

  routes = require('./../routes/index');

  dl = require("debug")('passport:log');

  de = require("debug")('passport:error');

  config = require('config');

  models = require('../models').models;

  rbac = require('../component/accesscheck').rbac;

  ldap = require('../routes/ldap');

  testCfg = require('../test/config.test');

  //从session里拿到本人信息，并判断查找的内容是否是本人的内容
  //operaterule:
  // 0=req.user.id
  // 1=req.person.id
  // 2=req.sponsor.id
  exports.validateruleopration = function(req, res, obj, operaterule = [0, 1, 2]) {
    var j, l, len, len1, o, operatecondition, ref, result, s, temp;
    operatecondition = {};
    result = false;
    if (operaterule.in_array(0)) {
      if (req.user) {
        operatecondition.account_id = req.user.id;
      } else {
        result = result || req.isadmin;
      }
    }
    if (operaterule.in_array(1)) {
      if (req.session.person) {
        operatecondition.person_id = req.session.person.id;
      } else {
        result = result || req.isadmin;
      }
    }
    if (operaterule.in_array(2)) {
      if (req.session.sponsors && req.session.sponsors.length > 0) {
        operatecondition.sponsor_id = [];
        ref = req.session.sponsors;
        for (j = 0, len = ref.length; j < len; j++) {
          s = ref[j];
          operatecondition.sponsor_id.push(s.id);
        }
      } else {
        result = result || req.isadmin;
      }
    }
    if (!util.isArray(obj)) {
      obj = [obj];
    }
    result = true;
    for (l = 0, len1 = obj.length; l < len1; l++) {
      o = obj[l];
      temp = exports.validatedataopration(req, o, operatecondition);
      result = result && temp;
    }
    return result;
  };

  //确认是否类型是否为4，或者obj==operatecondition
  exports.validatedataopration = function(req, obj, operatecondition) {
    var result;
    if (req.exadmin && req.isadmin) {
      if (obj && obj.length !== 0) {
        return true;
      } else {
        return false;
      }
    } else {
      result = util.compare_option(obj, operatecondition);
      if (result && result.length !== 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  exports.getOwnObject = function(req, res, model, findcondition, operaterule = [0, 1, 2], cb, errorcode = 1) {
    return exports.getOperateObject(req, res, model, findcondition, {}, function(err, result) {
      if (exports.validateruleopration(req, res, result, operaterule)) {
        return cb(null, result);
      } else {
        if (res != null) {
          return common.ressenderror(req, res, errorcode);
        } else {
          return cb(errorcode);
        }
      }
    }, errorcode);
  };

  
  exports.getOperateObject = function(req, res, model, findcondition, operatecondition, cb, errorcode = 1) {
    var orderby;
    orderby = [];
    if (findcondition.orderbystr != null) {
      orderby = [findcondition.orderbystr];
      delete findcondition.orderbystr;
    }
    return model.find(findcondition, orderby, {
      cache: false
    }, function(err, obj) {
      if (err) {
        console.log(err);
        return common.ressenderror(req, res);
      } else if (obj.length === 0) {
        if (errorcode === false) {
          return cb(null, obj);
        } else {
          return common.ressenderror(req, res, errorcode);
        }
      } else {
        if (exports.validatedataopration(req, obj, operatecondition)) {
          return cb(null, obj);
        } else {
          return common.ressenderror(req, res, errorcode);
        }
      }
    });
  };

  exports.canAccess = function(accesstypearr, req) {
    var accesstype, at, j, l, len, len1, minadminpermission, minpersonpermission, minsponsorpermission, ref, result, scheckstatus, sponsor, sstatus, user;
    user = req.user;
    //  req.accesstypearr=accesstypearr
    accesstype = -1;
    if (req.user) {
      accesstype = req.user.accesstype;
    }
    result = 2;
    minpersonpermission = 99;
    minsponsorpermission = 99;
    minadminpermission = 99;
    //  for at in accesstypearr
    //    if 1<=at<2 and at <minpersonpermission
    //      minpersonpermission=at
    //    if 2<=at<3 and at <minsponsorpermission
    //      minsponsorpermission=at
    //    if 4<=at<5 and at <minadminpermission
    //      minadminpermission=at
    if (indexOf.call(accesstypearr, 0) >= 0 || indexOf.call(accesstypearr, accesstype) >= 0) {
      result = true;
    } else {
      for (j = 0, len = accesstypearr.length; j < len; j++) {
        at = accesstypearr[j];
        if ((accesstype >= at && at >= Math.floor(accesstype))) {
          result = true;
          break;
        }
      }
      if (result === 2) {
        if (req.isperson && minpersonpermission !== 99) {
          if ((req.session.person == null) || req.session.person.status === 2) {
            result = 105;
          }
        }
        if (req.issponsor && minsponsorpermission !== 99) {
          sstatus = false;
          scheckstatus = false;
          ref = req.session.sponsors;
          for (l = 0, len1 = ref.length; l < len1; l++) {
            sponsor = ref[l];
            if (minsponsorpermission >= 2.1) {
              if (sponsor.status === 1) {
                sstatus = true;
                break;
              }
            } else if (minsponsorpermission === 2.2) {
              if (sponsor.checkstatus === 1) {
                scheckstatus = true;
                break;
              }
            }
          }
          if (sstatus === false) {
            result = 62;
          } else if (scheckstatus === false) {
            result = 63;
          }
        }
      }
    }
    return result;
  };

  //accesstypearr=[0,1]
  //0=本人，1=个人用户，2=组织，4=admin
  exports.ensureAuthenticated = (accesstypearr) => {
    return function(req, res, next) {
      var accesscode, j, len, ref, ref1, sponsor;
      if (indexOf.call(accesstypearr, 4) >= 0) {
        req.exadmin = true;
      }
      if (req.isAuthenticated()) {
        req.isadmin = req.user.type === 4;
        req.isperson = req.user.type === 1;
        req.issponsor = req.user.type === 2;
        req.user.accesstype = req.user.type;
        switch (req.user.type) {
          case 1:
            if ((req.session.person != null) && req.session.person.status === 1) {
              req.user.accesstype = 1.1;
            }
            break;
          case 2:
            if (req.session.sponsors && req.session.sponsors.length > 0) {
              ref = req.session.sponsors;
              for (j = 0, len = ref.length; j < len; j++) {
                sponsor = ref[j];
                if (sponsor.status === 1) {
                  if ((2 <= (ref1 = req.user.accesstype) && ref1 < 2.1)) {
                    req.user.accesstype = 2.1;
                  }
                }
                if (sponsor.checkstatus === 1) {
                  req.user.accesstype = 2.2;
                  break;
                }
              }
            }
            break;
          case 4:
            if (req.user.status === 1) {
              req.user.accesstype = 4.1;
            }
        }
      }
      console.log("isAuthenticated " + req.isAuthenticated());
      accesscode = exports.canAccess(accesstypearr, req);
      if (accesscode.toString() === 'true') {
        return next();
      } else {
        if (config.loginpage) {
          return common.gologin(req, res, accesscode);
        } else {
          return common.ressenderror(req, res, accesscode);
        }
      }
    };
  };

  exports.finduser = function(req, id, done) {
    return models.account.findOne({
      where: {
        id: id
      },
      include: [
        {
          model: models.role
        }
      ]
    }).then(function(result) {
      var account;
      console.log('result: ', result);
      account = result != null ? result : null;
      if (account != null) {
        return exports.getScope(account, function(account) {
          return done(null, account);
        });
      } else {
        return done(null, account);
      }
    });
  };

  //新建account
  exports.setupaccount = function(req, account, done) {
    var newdeviceid, olddeviceid, setaccountobj;
    req.user = account;
    olddeviceid = account.deviceid;
    common.getreqparameter(req, null, account, 'deviceid', null, false);
    newdeviceid = account.deviceid;
    account.lastlogintime = new Date();
    setaccountobj = function(account, done) {
      switch (account.type) {
        case 1:
          return account.getPerson(common.ormerrhandler(req, null, false, function(err, person) {
            if (person) {
              if (person.length > 0) {
                req.session.person = person[0];
                account.person = person[0];
              } else {
                req.session.person = person;
                account.person = person;
              }
            }
            return done(null, account);
          }));
        case 2:
          return account.sponsors = account.getSponsors(common.ormerrhandler(req, null, false, function(err, sponsor) {
            var added, j, len, ref, results, s;
            if (sponsor && sponsor.length > 0) {
              added = 0;
              account.sponsors = sponsor;
              ref = account.sponsors;
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                s = ref[j];
                results.push(s.getFinance(function(err, obj) {
                  var sfinance;
                  if (obj) {
                    sfinance = obj;
                  } else {
                    sfinance = common.createdefaultfinance();
                  }
                  s.finance = sfinance;
                  added++;
                  if (added === account.sponsors.length) {
                    req.session.sponsors = account.sponsors;
                    return done(null, account);
                  }
                }));
              }
              return results;
            } else {
              return done(null, account);
            }
          }));
        case 4:
          return done(null, account);
      }
    };
    if (account.deviceid) {
      account.accountkey = util.computepassword(account.password + account.id + account.deviceid + config.accountsalt + (new Date()).valueOf());
    }
    if (olddeviceid !== newdeviceid) {
      account.devicetoken = null;
      models.devicetoken.findOne({
        where: {
          deviceid: newdeviceid,
          usertype: account.type
        }
      }).then(function(obj1) {
        console.log(err1);
        if (obj1 && obj1.length > 0) {
          account.devicetoken = obj1[0].token;
          account.devicetype = obj1[0].devicetype;
        }
        account.save();
        return setaccountobj(account, done);
      });
    } else {
      account.save();
      setaccountobj(account, done);
    }
  };

  exports.login = function(req, username, password, done) {
    var accountkey, checkUser, deviceid, openid, state, type;
    type = req.param('type');
    openid = req.param('openid');
    state = req.param('state');
    accountkey = req.param('accountkey');
    deviceid = req.param('deviceid');
    dl(`state is ${req.session.wechatstate} :  ${state}`);
    req.session.person = null;
    req.session.sponsors = null;
    // 正式上线后删除这个判断
    checkUser = function(cb) {
      var idArr, key, ldapusername, ref, value;
      idArr = [];
      ref = testCfg.roles;
      for (key in ref) {
        value = ref[key];
        idArr.push(value.id);
      }
      idArr = idArr.concat(['superMan', 'A_manager_B', 'A_general']);
      //    if config.test and username in idArr
      if (indexOf.call(idArr, username) >= 0) {
        return cb();
      } else {
        ldapusername = 'ap\\' + username;
        return ldap.getLdapInfo('', ldapusername, password, 'login').then(function(result) {
          if (!result) {
            return done(null, false, {
              message: '105'
            });
          }
          return cb();
        }).catch(function(err) {
          console.log('err: ', err);
          return done(null, false, {
            message: '101'
          });
        });
      }
    };
    return checkUser(function() {
      if (username != null) {
        return models.account.findOne({
          where: {
            id: username,
            status: 1
          },
          include: [
            {
              model: models.role
            }
          ]
        }).then(function(result) {
          var account;
          account = result;
          if (account == null) {
            return done(null, false, {
              message: '103'
            });
          }
          return exports.getScope(account, function(account) {
            req.user = account;
            return done(null, account);
          });
        });
      } else {
        return done(null, false, {
          message: '102'
        });
      }
    });
  };

  exports.getScope = function(account, cb) {
    var i, j, len, r, ref;
    account.dataValues.scopes = [];
    ref = account.roles;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      r = ref[i];
      rbac().getScope(r.id, function(err, scope) {
        return account.dataValues.scopes = account.dataValues.scopes.concat(scope);
      });
    }
    return cb(account);
  };

  //检验用户名
  exports.checkusername = function(req, res, account, cb, autoreturnerr = true) {
    return models.account.findOne({
      where: {
        username: account.username
      }
    }).then(function(obj) {
      //    if err
      //      if autoreturnerr
      //        common.ressenderror(req,res,0)
      //      else
      //        #0内部错误
      //        cb(0)
      //    else
      //    console.log(obj)
      if (obj != null) {
        if (autoreturnerr) {
          return common.ressenderror(req, res, 14);
        } else {
          return cb(14, obj[0]);
        }
      } else {
        return cb();
      }
    }).catch(common.catchsendcode(req, res, 0));
  };

  //判断did是否在uid的范围内
  exports.canopreate = function(req, res, did, uid, errcode = 2) {
    if (req.isadmin || (did === uid) || (util.isArray(uid) && indexOf.call(uid, did) >= 0)) {
      return true;
    } else {
      if (errcode) {
        common.ressenderror(req, res, errcode);
      }
      return false;
    }
  };

  exports.operatecondition = function(req, ps) {
    var k, p, result;
    result = {};
    if (req.isadmin) {

    } else {
      for (k in ps) {
        p = ps[k];
        if (p.indexOf('@') === 0) {
          p = p.replace('@', '');
          result[k] = eval(p);
        }
      }
    }
    return result;
  };

}).call(this);
