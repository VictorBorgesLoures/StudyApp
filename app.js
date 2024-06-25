require('dotenv').config();

let imageManager = require('./src/studyapp/ImageManager');
let fs = require('fs');
let path = require('path');
let dbStudyAppManager = require('./src/database/StudyAppManager');

const app = require('express')();
require('./config/loader.js')(app);

const port = process.env.PORT || 3000;
const server = require('http').createServer(app);

server.listen(port, (res) => {
    var address,
        ifaces = require('os').networkInterfaces();
    for (var dev in ifaces) {
        ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address : undefined);
    }

    console.log("Server running on adress: " + address + ":" + port);

    fixImages();

});

function fixImages() {
    console.log("FIX IMAGES: START");
    let imagesDir = path.join(__dirname, 'public', 'images', 'cards');

    imageManager.getImages();

    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.log("Error on reading image files");
            return;
        }

        let promisses = [];

        dbStudyAppManager._getAllCards().then(({ error, results }) => {
            if (error) {
                console.log("FIX IMAGES: ERROR");
                console.log(error);
                return;
            }
            for (i = 0; i < results.length; i++) {
                let card = results[i];
                promisses.push(imageManager.updateImages(card, files));
            }

            Promise.all(promisses).then(resp => {
                console.log("FIX IMAGES: UNWANTED IMAGES");
                imageManager._fixUnwantedImages(true);
                console.log("FIX IMAGES: FINISH");
            })
        })

    });
}