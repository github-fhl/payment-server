(function() {
  var appconfig, common, config, de, dl, https, querystring;

  https = require('https');

  dl = require('debug')('sms:log');

  de = require('debug')('sms:error');

  querystring = require('querystring');

  config = require('../config');

  appconfig = require('./appcfg');

  common = require('./common');

  exports.send = function(mobiles, message, cb) {
    var apiKey, content, options, postData, req;
    if (config.smsdebug) {
      dl(mobiles + ":" + message);
      cb();
    }
    postData = {
      mobile: mobiles,
      message: message + appconfig.smssign
    };
    content = querystring.stringify(postData);
    apiKey = config.smsaccount.key;
    options = {
      host: 'sms-api.luosimao.com',
      path: '/v1/send.json',
      method: 'POST',
      auth: "api:key-" + apiKey,
      agent: false,
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': content.length
      }
    };
    req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        return dl(JSON.parse(chunk));
      });
      return res.on('end', function() {
        return cb();
      });
    });
    req.write(content + '');
    return req.end();
  };

}).call(this);
