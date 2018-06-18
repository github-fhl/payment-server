(function() {
  var appconfig, common, config, de, dl, models, moment, passport, uploadcom, util, validator;

  common = require('./common');

  config = require('../config');

  passport = require('./passport');

  moment = require('moment');

  validator = require('validator');

  appconfig = require("./appcfg");

  util = require("./util");

  uploadcom = require("./../component/upload");

  models = require('../models').models;

  dl = require("debug")('eventcom:log');

  de = require("debug")('eventcom:error');

  exports.create = function(req, res, account, person, cb) {
    var tperson;
    tperson = {};
    if (util.isFunction(person)) {
      cb = person;
    } else {
      tperson = person;
    }
    if (account.password != null) {
      account.password = util.computepassword(account.password);
    } else {
      return cb(10);
    }
    return passport.checkusername(req, res, account, function(err, accountobj) {
      if (err) {
        cb(err, {
          user: accountobj
        });
        return;
      }
      return models.account.create(account).then(function(account) {
        dl(account);
        return cb(null, {
          user: account
        });
      })["catch"](common.catchsendcode(req, res));
    });
  };

}).call(this);
