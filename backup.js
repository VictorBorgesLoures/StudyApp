let fs = require('fs');
let path = require('path');

function backupStudyApp() {
    let dir = "C:/Users/victo/Documents/Desenvolvimento Web/programaestudo/backend/backup";
    let date = new Date();
    let folderName = date.getDate() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getFullYear() + "_" + date.getHours() + "." + date.getMinutes()
    fs.mkdir(path.join(dir, folderName), err => {
        if (err) {
            console.log("ERROR CREATING FOLDER");
            console.log(err);
        } else {
            console.log("FOLDER CREATED WITH SUCCESS!");
            console.log(path.join(dir, folderName));

            fs.mkdir(path.join(dir, folderName, "mysql"), cb => {
                fs.mkdir(path.join(dir, folderName, "mysql", "studyapp"), cb => {
                    fs.mkdir(path.join(dir, folderName, "images"), sb => {
                        backupMysql('studyapp', path.join(dir, folderName)).then(resolve => {
                            backupImages(path.join("C:/Users/victo/Documents/Desenvolvimento Web/programaestudo/backend/", "public", "images", "cards"), path.join(dir, folderName, "images")).then(resp => {
                                resp ? console.log("Success to backup images") : console.log("Fail to backup images");
                            })
                        })
                    })
                });
            })

        }
    })

};

function backupMysql(database, dir) {
    return new Promise((resolve, reject) => {
        try {
            let files = [
                "ib_logfile0",
                "ib_logfile1",
                "ibdata1",
                "ibtmp1"
            ];

            let promisses = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                promisses.push(
                    readWrite("C:/xampp/mysql/data/" + file, path.join(dir, 'mysql', file), file)
                );
            }

            Promise.all(promisses).then(resp => {
                promisses = [];
                fs.readdir("C:/xampp/mysql/data/" + database, (err, files) => {
                    if (err) {
                        console.log("ERROR READING FILES");
                        console.log(err);
                        resolve(false);
                    } else {
                        files.forEach(file => {
                            let fileA = file.split('.');
                            if (fileA[fileA.length - 1] == "frm" || fileA[fileA.length - 1] == "ibd") {
                                promisses.push(
                                    readWrite(path.join("C:/xampp/mysql/data", database, file), path.join(dir, 'mysql', database, file), file)
                                );
                            }
                        });
                        Promise.all(promisses).then(resp => {
                            resolve(true);
                            console.log("SUCCES BACKUP MYSQL FILES");
                        })
                    }
                })
            })

        } catch (e) {
            console.log("FAIL TO BACKUP UNEXPECTED ERROR");
            console.log(e);
            resolve(false);
        }

    })
}

function readWrite(readPath, writePath, file) {
    return new Promise(resolve => {
        try {
            fs.readFile(readPath, (err, data) => {
                if (err) {
                    console.log("ERROR READING FILE:" + file);
                    console.log(err);
                    resolve(false);
                } else {
                    fs.writeFile(writePath, data, err => {
                        if (err) {
                            console.log("ERROR WRITTING FILE:" + file);
                            console.log(err);
                        }
                        console.log("SUCCES:" + file);
                        resolve(true);
                    })
                }
            })
        } catch (e) {
            resolve(false);
        }
    })
}

function backupImages(readPath, writePath) {
    return new Promise(resolve => {
        try {
            fs.readdir(readPath, (err, files) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                } else {
                    let promisses = [];
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        promisses.push(
                            readWrite(path.join(readPath, file), path.join(writePath, file), file)
                        );
                    }
                    Promise.all(promisses).then(resp => {
                        resolve(true);
                    })
                }
            })
        } catch (e) {
            console.log(e);
            resolve(false)
        }
    })
}

backupStudyApp();