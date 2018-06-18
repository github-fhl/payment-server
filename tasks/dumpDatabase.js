const
  schedule = require('node-schedule'),
  moment = require('moment'),
  util = require('util'),
  exec = util.promisify(require('child_process').exec),
  {mysql, databaseFilesPath, helperPath} = require('config'),
  {database, username, password} = mysql,
  helper = require(helperPath);

let run = async () => {
  let fileName = `Payment ${moment().format('YYYY-MM-DD hh:mm:ss')}.sql`;
  helper.common.mkdirRecursion(databaseFilesPath);
  await exec(`mysqldump -u ${username} -p${password} ${database} > ${databaseFilesPath}/'${fileName}'`);
  return fileName;
}

schedule.scheduleJob('0 0 1 * * *', () => {
  run().then((fileName) => {
    console.log(`数据库${fileName}备份完毕`)
  }).catch(err => console.log(err));
})
