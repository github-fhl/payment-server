(function() {
  var appconfig, common, config, de, dl, moment, passport, util, uuid, validator;

  common = require('./common');

  config = require('../config');

  passport = require('./passport');

  moment = require('moment');

  validator = require('validator');

  appconfig = require("./appcfg");

  util = require("./util");

  uuid = require('uuid');

  dl = require("debug")('upload:log');

  de = require("debug")('upload:error');

  exports.uploadfile = function(req, args, cb) {
    var fileid, i, imgid, len, nexttasks, path, paths, ref, uploadtype;
    uploadtype = appconfig.uploadtype[args.type];
    if (uploadtype) {
      nexttasks = [];
      paths = [];
      ref = args.imgurls;
      for (i = 0, len = ref.length; i < len; i++) {
        imgid = ref[i];
        fileid = uuid.v1();
        path = "" + uploadtype.osspath + fileid + ".jpg";
        paths.push(path);
        nexttasks.push({
          actiontype: 500,
          target: imgid,
          desc: path,
          status: 1
        });
      }
      req.models.task.create(nexttasks, function() {});
      return cb(null, {
        path: paths
      });
    } else {
      return cb(1002);
    }
  };

}).call(this);
