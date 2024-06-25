class ImageManager {

    constructor() {
        if (this.constructor === ImageManager) {
            throw new Error('Static class "ImageManager" cannot be instantiated directly.');
        }
    }

    static updateImages(card, images = null) {
        return new Promise(async resolve => {
            try {
                if (!images) {
                    images = await ImageManager.getImages();
                }

                let summary = JSON.parse(card.summary);
                let text = JSON.parse(card.text);
                let foundChange = false;
                for (let entity in summary.entityMap) {
                    let e = summary.entityMap[entity];
                    if (e.type == "IMG") {
                        let newSrc = ImageManager._entitySrcAlreadyChanged(card.id, e.data.src);
                        if (newSrc) {
                            foundChange = true;
                            let iSrc = e.data.src;
                            e.data.src = newSrc;
                            card.summary = JSON.stringify(summary);
                            for (let i = 0; i < images.length; i++) {
                                let image = images[i];
                                if (image == iSrc) {
                                    fs.rename(path.join(imageDir, iSrc), path.join(imageDir, newSrc), error => {
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                }
                            }
                        }

                    }
                }
                for (let entity in text.entityMap) {
                    let e = text.entityMap[entity];
                    if (e.type == "IMG") {
                        let newSrc = ImageManager._entitySrcAlreadyChanged(card.id, e.data.src);
                        if (newSrc) {
                            foundChange = true;
                            let iSrc = e.data.src;
                            e.data.src = newSrc;
                            card.text = JSON.stringify(text);
                            for (let i = 0; i < images.length; i++) {
                                let image = images[i];
                                if (image == iSrc) {
                                    fs.rename(path.join(imageDir, iSrc), path.join(imageDir, newSrc), error => {
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                }
                            }
                        }
                    }
                }

                if (foundChange) {
                    StudyAppManager.updateCard(card.user_id, card.id, card).then(resp => {
                        console.log("FIX IMAGES: CARD UPDATED:" + card.id);
                        ImageManager.removeTrashImage(card);
                        resolve(true);
                    })
                } else {
                    ImageManager.removeTrashImage(card);
                    resolve(false);
                }
            } catch (e) {
                console.log(e);
                resolve(false);
            }
        })

    }

    static removeTrashImage(card) {
        ImageManager.getCardImages(card.id).then(cardImages => {
            let entitiesSummary = JSON.parse(card.summary).entityMap;
            let entitiesText = JSON.parse(card.text).entityMap;
            let allImages = [];
            let imagesToRemove = [];
            for (let obj in entitiesSummary) {
                if (entitiesSummary[obj].type == "IMG") {
                    allImages.push(entitiesSummary[obj].data.src);
                }
            }

            for (let obj in entitiesText) {
                if (entitiesText[obj].type == "IMG") {
                    allImages.push(entitiesText[obj].data.src);
                }
            }

            for (let i = 0; i < cardImages.length; i++) {
                let found = false;
                for (let c = 0; c < allImages.length; c++) {
                    if (cardImages[i] == allImages[c]) {
                        found = true;
                    }
                }
                if (!found) {
                    imagesToRemove.push(cardImages[i]);
                }
            }
            if (imagesToRemove.length > 0) {
                console.log("REMOVING IMAGES ON CARD:" + card.id);
                for (let i = 0; i < imagesToRemove.length; i++) {
                    fs.unlink(path.join(imageDir, imagesToRemove[i]), cb => {
                        console.log('IMAGE REMOVED: ' + imagesToRemove[i]);
                    })
                }
            }

        })
    }

    static deleteAllCardImages(card) {
        return new Promise(async (resolve, reject) => {
            try {
                let summary = JSON.parse(card.summary);
                let text = JSON.parse(card.text);

                for (let entity in summary.entityMap) {
                    let e = summary.entityMap[entity];
                    if (e.type == "IMG") {
                        ImageManager.deleteImage(e.data.src);
                    }
                }
                for (let entity in text.entityMap) {
                    let e = text.entityMap[entity];
                    if (e.type == "IMG") {
                        ImageManager.deleteImage(e.data.src);
                    }
                }
                resolve(true);

            } catch (error) {
                console.log(error);
                resolve(false);
            }
        })
    }

    static getCardImages(cardId) {
        return new Promise((resolve, reject) => {
            try {
                ImageManager.getImages().then(images => {
                    if (images.length > 0) {
                        let cardImages = [];
                        let regex = new RegExp("^" + cardId + "-");
                        for (let i = 0; i < images.length; i++) {
                            if (regex.test(images[i])) {
                                cardImages.push(images[i]);
                            }
                        }
                        resolve(cardImages);
                    } else {
                        resolve([])
                    }
                })
            } catch (e) {
                console.log(e)
                resolve([]);
            }
        })
    }

    static deleteImage(src) {
        try {
            ImageManager.getImages().then(images => {
                for (let i = 0; i < images.length; i++) {
                    if (images[i] == src) {
                        fs.unlink(path.join(imageDir, src), cb => {
                            console.log('IMAGE REMOVED: ' + src);
                        });
                    }
                }
            })
        } catch (e) {
            console.log(e);
        }
    }

    static getImages() {
        return new Promise((resolve, reject) => {
            try {
                fs.readdir(imageDir, (err, files) => {
                    if (err) {
                        console.log("Error on reading image files");
                        resolve([]);
                    }
                    resolve(files);
                });
            } catch (e) {
                console.log(e)
                resolve([]);
            }
        });
    }

    static _entitySrcAlreadyChanged(cardid, imageName) {
        let imageArray = imageName.split('-');
        if (imageArray.length < 3) {
            return cardid + "-" + imageName;
        } else {
            return '';
        }
    }

    static _fixUnwantedImages(checked = false) {
        return new Promise(resolve => {
            if (!checked) {
                console.log("_fixUnwantedImages: this function remove all card images that dosen't have id on them, pass 'true' on param;");
                return;
            }
            // ONLY USE THIS FUNCTION WHEN ALL IMAGES ARE FIXED;
            // TODO get all images on folder;
            ImageManager.getImages().then(files => {
                // TODO get all images that not have id on them and remove;
                for (let i = 0; i < files.length; i++) {
                    const image = files[i];
                    let nameSplited = image.split('-');
                    if (nameSplited.length == 2) {
                        console.log(image);
                        fs.unlink(path.join(imageDir, image), cb => {
                            console.log("FIX IMAGES: REMOVED -> " + image);
                        })
                    }
                }
            })
        }).catch(e => {
            console.log(e);
        })
    }
}

module.exports = ImageManager;

let StudyAppManager = require('./Manager');
let fs = require('fs');
let path = require('path');
const debug = require('../debug/Debugger');

let imageDir = path.join(__dirname, '../../public', 'images', 'cards');