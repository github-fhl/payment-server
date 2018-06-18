const
    multer = require('multer'),
    path = require('path'),
    moment = require('moment'),
    {publicdir, uploaddir, helperPath} = require('config'),
    {mkdirRecursion} = require(helperPath).common,
    {getSheetsName} = require('../../helper')

const storage = multer.diskStorage({
    destination(req, file, next) {
        let destination = `${uploaddir}/${moment().format('YYYYMMDD')}`

        mkdirRecursion(destination)
        next(null, destination)
    },
    filename(req, file, next) {
        let postfix = file.originalname.split('.')[1]
        let fileName = file.originalname.split('.')[0]

        next(null, `${fileName}-${Date.now()}.${postfix}`)
    }
})

let upload = multer({storage})

exports.cpUpload = upload.single('file')

let uploadFile = async (req, res) => {

  console.log('filePath: ', req.file.path)
    let sheets
    let filePath = path.relative(publicdir, req.file.path);
    let fileType = filePath.substring(filePath.lastIndexOf(".") + 1);

    if (['cvs', "xls", "xlsx"].includes(fileType)) {
        sheets = await getSheetsName(filePath);
    }

    console.log('filePath: ', filePath)

    res.json({
        obj: filePath,
        sheets: sheets,
        status: 'success'
    })
}

exports.uploadFile = uploadFile
