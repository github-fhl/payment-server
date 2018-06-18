const
  {cpUpload, uploadFile} = require('../controller/upload')

module.exports = router => {

  router.route('/v2/uploadFile')
    .post(cpUpload, uploadFile)
}
