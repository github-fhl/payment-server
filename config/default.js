const
  cfg = require('./appconfig/cfg'),
  flowCfg = require('./appconfig/flowCfg'),
  errors = require('./appconfig/errors'),
  init = require('./appconfig/init'),
  path = require('path'),
  mainPath = path.join(require.main.filename, '..')

module.exports = {
  mysql: {
    database: 'payment_test',
    username: 'root',
    password: 'root',
    options: {
      host: '127.0.0.1',
      port: '3306',
      dialect: 'mysql'
    }
  },
  cache: false,
  port: 9500,
  cfg,
  flowCfg,
  errors,
  init,
  basis: {},
  databaseFilesPath: path.join(mainPath, 'databaseFiles'),
  tempPath: path.join(mainPath, 'public/temp'),
  helperPath: path.join(mainPath, 'src/helper'),
  modelPath: path.join(mainPath, 'models'),
  componentPath: path.join(mainPath, 'component'),
  productionPort: 9500,
  mainPath,
  
  // v1 版本config 参数
  debug: true,
  test: true, 
  smsdebug: true,
  cluster: false,

  publicdir: path.join(mainPath, 'public'),
  uploaddir: path.join(mainPath, 'public/upload'),
  downloaddir: path.join(mainPath, 'public/download'),
  serverurl: this.test ? "http://localhost:3000/api/" : "http://10.139.152.224:8080/api/",
  domain:'',

  accountsalt:'111',
  hexcharacters:'0123456789ABCDEF',

  staticdir:"public",

  projectname: 'payment 2.0',
  projectkey: 'wArXUZUPeQjAQiYVrGFhBh3PaXHUFSn50XcPVdylBD5LxUrhDP8wg2zbktS1cTlFGkMH3oeCakE5stnDEI+LhyCUizGs8jw96rMOxNFcxA7TbDnmP1bXBa8i02Pxy/+y/tCIvv4KEkzhulC25R0EZRBPTbAxZLGT9L5PsN49Gww='
}
