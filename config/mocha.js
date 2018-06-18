const
  path = require('path'),
  mainPath = path.join(require.main.filename, '../../../..')

module.exports = {
  mainPath,
  databaseFilesPath: `${mainPath}/databaseFiles`,
  helperPath: path.join(mainPath, 'src/helper'),
  modelPath: path.join(mainPath, 'models'),
  componentPath: path.join(mainPath, 'component'),
  uploaddir: `${mainPath}/public/upload/`,
  downloaddir: `${mainPath}/public/download/`,
}
