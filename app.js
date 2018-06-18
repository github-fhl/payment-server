const
      dbcommon = require("./dbcommon")
    , fs = require("fs")
    , busboy = require("connect-busboy") //middleware for form/file upload
    , moment = require("moment")
    , SessionStore = require("express-mysql-session")
    , flash = require("connect-flash")
    , passport = require("passport")
    , LocalStrategy = require("passport-local").Strategy
    , express = require("express")
    , routes = require("./routes")
    , routes2_gcy = require("./src/router")
    , http = require("http")
    , path = require("path")
    , router = express.Router()
    , session = require("express-session")
    , logger = require("morgan")
    , cookieParser = require("cookie-parser")
    , bodyParser = require("body-parser")
    , errorhandler = require("errorhandler")
    , uuid = require("uuid")
    , passportroutes = require("./component/passport")
    , config = require("config")
    , models = require("./models")
    , accesscheck = require('./component/accesscheck')
    , common = require('./component/common')
    , commonfs = require("./routes/commonfs")
;

const
  modelConfig = require('config').get('mysql')


let app = express();

require('./tasks'); // 执行任务
if(!config.debug){
    app.set("env","production")
};

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, config.staticdir), { maxAge: 1000 }));

var whitelist = ["http://127.0.0.1:9500", "http://localhost:9500", "http://localhost:9201", "http://localhost:9333"];
var whitedomain=[];
//app.use(compression({threshold: 128}));
app.set("json spaces",0);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.setHeader("P3P","CP=CAO PSA OUR");//跨域访问cookie
    var origin=typeof req.headers.referer=="undefined"?req.headers.origin:req.headers.referer;
    res.header("Access-Control-Allow-Origin", (function(origin){
        console.log(new Date()+"origin is :" + origin);
        if(typeof origin=="undefined" || origin.toString()=="null")
        {
            return "null";
        }
        else if (origin && origin.indexOf("file")==0)
        {
            return "file://";
        }
        else if(origin)
        {
            var or=origin.match(/(\w+):\/\/([^/:]+)(:\d*)?/)
            if(or && or.length>0)
            {
                var o=or[0];
                console.log("site host is :" + o);
                var originIsWhitelisted = whitelist.indexOf(o) !== -1;
                if(originIsWhitelisted==false){
                    for(var i=0;i<whitedomain.length;i++){
                        var wd = whitedomain[i];
                        if(o.indexOf('.'+wd)== o.replace('.'+wd,'').length)
                        {
                            originIsWhitelisted=true;
                            break;
                        }
                    }
                }
                if(originIsWhitelisted){
                    console.log(o+"in whitelist")
                    return o;
                }
                else
                {
                    console.log(o+"not in whitelist")
                    return "";
                }
            }
        }

    })(origin));
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    if(req.method == "OPTIONS")
    {
        console.log("res end");
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("okay");
    }
    else
    {
        console.log("res next");
        next();
    }
});

app.disable("x-powered-by");

app.use(flash());
app.use(busboy());


// all environments
var port=process.env.PORT || config.port;
app.set("port",port );
if(process.argv[2] === 'mocha-test'){
  app.set("port",port + 1);
}

app.use(express.query());
app.use(logger("dev"));

app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser("loncus"));//解析secret为loncus的cookie
//seession存储时间为1年，secret和cookie一致


// session 配置
let MySQLOptions = {
  host: modelConfig.options.host,
  port: modelConfig.options.port,
  user: modelConfig.username,
  password: modelConfig.password,
  database: modelConfig.database
}

app.use(session({ secret: "loncus" ,
  cookie: {
    domain: config.domain,
    path: '/',
    httpOnly: true,
    maxAge: 1000*60*60*3
  },
  saveUninitialized: true,
  resave: true,
  rolling: true,
  store: new SessionStore(MySQLOptions)
}));
app.use(function(req, res, next) {
    //上传png postfile
    if(req.originalUrl.indexOf("/uploadfile")==0&&req.method=="POST")
    {
        req.pause();
        res.header("Cache-Control", "no-cache");
        var fileid = uuid.v1();
        var pathname = moment().format("YYYYMMDD");
        var filepath = commonfs.getfsfilepath(config.uploaddir + pathname)+ '/' + fileid + '.png';
        var wstream = fs.createWriteStream(filepath);
        if (req.get("content-type").indexOf("multipart/form-data;") == 0) {
            console.log("go busboy");
            req.pipe(req.busboy);
            req.busboy.on("file", function (fieldname, file, filename) {
                console.log("Uploading: " + filename);
                file.pipe(wstream);
                wstream.on("close", function () {
                    console.log("Upload Finished of " + filename);
                    req.session.lastuploadtime = new Date();
                    res.json({
                        success: true,
                        file: 'upload/' + pathname + "/" + fileid + '.png'
                    });
                });
            });
        }
        else {

            var bufferstr = "";
            req.on("data", function (chunk) {
                console.log("数据接收...");
                if (typeof req.param("m") != "undefined") {
                    bufferstr += chunk.toString();
                }
                else {
                    wstream.write(chunk);
                }
            });
            req.on("end", function (a, b, c) {
                console.log("数据接收完毕");
                if (bufferstr) {
                    wstream.end(bufferstr, "base64");
                }
                else {
                    wstream.end();
                }
                req.session.lastuploadtime = new Date();
                res.json({
                    success: true,
                    file: pathname + "/" + fileid
                });

            });
            req.resume();
        }
    }
    else{
        next();
    }
});


app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
 //session序列化与反序列化
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(passportroutes.finduser);


// 配置passport策略
passport.use(new LocalStrategy({passReqToCallback:true,failWithError:true,usernameField:'id'},
    passportroutes.login
));

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  let acceptPath = ['/login', '/v2/initPayment']

  if (!acceptPath.includes(req.path) && !req.user) {
    res.json({
      "status": "failed",
      "msg": "请重新登录",
      "code": 104
    })
  }
  else {
    next()
  }
})

app.use(router);

// development only
if ("development" == app.get("env")) {
//if (true) {
    app.use(errorhandler());
}
else{
// Handle 404
    app.use(function(req, res) {
        res.send("404: Page not Found", 404);
    });

// Handle 500
    app.use(function(error, req, res, next) {
        console.log(error);
//    res.send("500: Internal Server Error", 500);
        res.redirect( "/");
    });
}


models.sequelize.sync().then(function(){
    accesscheck.buildPermission(function(rbac){
        routes(router,rbac,passport);
        routes2_gcy(router, rbac);
    })
});



if(!config.cluster) {

    http.createServer(app).listen(app.get("port"), function(){
      console.log("Express server listening on port " + app.get("port"));
    });
}
else
{
    var cluster = require("cluster");

    if(cluster.isMaster){
        var numCPUs = require("os").cpus().length;
        var numReqs = 0;
        console.log("宿主启动…");
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        cluster.on("listening",function(worker,address){
            console.log("核心"+i+" pid:"+ worker.process.pid);
        });
        cluster.on("exit", function(worker, code, signal) {
            console.log("核心"+i+" pid:"+ worker.process.pid+" 重启")
            setTimeout(function() {cluster.fork();},2000);
        });
    }else{
        http.createServer(app).listen(app.get("port"), function () {
            console.log("Express server listening on port " + app.get("port"));
        });
    }
}

// 获取全局未捕捉错误
process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception: ' + err);
});
