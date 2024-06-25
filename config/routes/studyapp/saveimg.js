var fs = require('fs');
var multer = require('multer');
var { execFile } = require('child_process');
/*
const storage = multer.diskStorage({
    dest: './public/images/cards',
    filename: function (req, file, cb) {
        var splited = file.originalname.split('.');
        var type = splited[splited.length - 1];
        cb(null, Date.now() + '-cardsimages')
    }
})


var saveImg = multer(
    {
        storage: storage,
        limits: {
            fileSize: 10000000
        },
        fileFilter: function (req, file, cb) {
            sanitizeFile(file, cb);
        }
    }
).single('cardsimages')

*/

const storage = multer.diskStorage({
    destination: "./public/images/cards/",
    filename: function (req, file, cb) {
        var splited = file.originalname.split('.');
        var type = splited[splited.length - 1];
        cb(null, Date.now() + '-cardsimages')
    }
 });
 const upload = multer({
    storage: storage
 })

function imageFormat(mimetype) {
    var split = mimetype.split('/');
    var type = split[split.length - 1];
    if (type == 'jpg' || type == "gif" || type == "png") {
        return type;
    }
    else {
        return false;
    }
}

function sanitizeFile(file, cb) {

    var imageType = imageFormat(file.mimetype);

    if (imageType) {
        return cb(null, true)
    }
    else {
        cb(new Error('Error: File type not allowed!'))
    }
}

module.exports = upload;