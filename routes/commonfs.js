(function() {
  var config, fs, moment;

  fs = require("fs");

  moment = require("moment");

  config = require('config');


  /*exports.createqrcode=(url,cb)->
    qrcode.toDataURL(url,(err,codeimg)->
      if err
        cb({success: false})
      else
        base64Data = codeimg.replace(/^data:image\/\w+;base64,/, "")
        dataBuffer = new Buffer(base64Data, 'base64')
        cb({success:true,imgbase:dataBuffer})
    )
   */

  exports.getfsfilepath = function(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    return path;
  };

  exports.saveimgbase64 = function(imgbase, filepath, imgname, cb) {
    filepath = exports.getfsfilepath(filepath);
    return fs.writeFile(filepath + "/" + imgname + ".jpg", imgbase, function(errfs) {
      if (errfs) {
        return cb({
          success: false
        });
      } else {
        return cb({
          success: true
        });
      }
    });
  };

  exports.createcodenum = function(para, cb) {

    /*textlen=6
    if para.textlen &&  para.textlen >0 && para.textlen< 6
      textlen=para.textlen
    dw= 160
    dh=parseInt(dw/(para.width/para.height))
    captcha = ccap({
      width:dw
      height:dh
      textlen:textlen
    })
    ary = captcha.get();
    txt = ary[0]
    txtnew=""
    if textlen==6
      txtnew=txt
    else
      txtnew=txt.substr(0,textlen)
     */
    var ary, buf, imgbase64, txtnew;
    ary = para.captcha.get();
    txtnew = ary[0].substr(0, 4);
    buf = ary[1];
    imgbase64 = "data:image/jpeg;base64," + (buf.toString("base64"));
    if (cb) {
      return cb({
        txt: txtnew,
        buf: buf,
        imgbase64: imgbase64
      });
    }
  };

  exports.getQueryString = function(para, name) {
    var r, reg;
    reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    r = para.substr(0).match(reg);
    if (r !== null && r.length > 0) {
      return r[2];
    } else {
      return "";
    }
  };

}).call(this);
