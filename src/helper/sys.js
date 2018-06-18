const fs = require('fs'),
  path = require('path'),
  {mainPath} = require('config')

// 传入文件夹名, 获取所有子集方法
exports.getAPIs = dirname => {
  const object = {};
  const filePath = dirname.includes('payment-service') ? dirname : path.join(mainPath, dirname);
  const files = fs.readdirSync(filePath);

  files.forEach(file => {
    const name = file.replace('.js', '');
    if (['index', 'test'].includes(name)) return;
    const childFilePath = path.join(filePath, name);

    object[name] = require(childFilePath);
  });

  return object;
}
