let query = require('./connection').query;

let Generators = require('../helpers/Generators');

class UserManager {

    constructor() {
        if (this.constructor === UserManager) {
            throw new Error('Static class "UserManager" cannot be instantiated directly.');
        }
    }

    static RegisterUser(user) {
        return new Promise(resolve => {
            try {
                this._RegisterUser(user)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error, results });
                        }
                    })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })

            }
        });
    }

    static _RegisterUser(user) {
        return new Promise(async resolve => {
            try {
                Generators.generateToken(user.password)
                    .then(passToken => {
                        query("INSERT INTO `users` (`username`,`email`,`password`) values(?,?,?);", [user.username, user.email, passToken])
                            .then(({ errors, results }) => {
                                if (errors) {
                                    resolve({ errors });
                                } else {
                                    if (results.insertId > 0) {
                                        query("INSERT INTO `users_data` (`user_id`,`data`) values(?,?);", [results.insertId, JSON.stringify({})]);
                                    }
                                    resolve({ errors, results });
                                }
                            });
                    })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static getMetaData(userId) {
        return new Promise(async resolve => {
            try {
                query("SELECT * FROM `users_data` WHERE `user_id`=?;", [userId])
                    .then(({ errors, results }) => {
                        if (errors) {
                            resolve({ errors });
                        } else {
                            resolve({ errors, results });
                        }
                    });
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static setMetaData(userId, newData) {
        return new Promise(async resolve => {
            try {
                query("INSERT INTO `users_data` SET `data`=? WHERE `user_id`=?;", [userId, newData])
                    .then(({ errors, results }) => {
                        if (errors) {
                            resolve({ errors });
                        } else {
                            resolve({ errors, results });
                        }
                    });
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static LoginAttempt(loginAttempt, type) {
        return new Promise(resolve => {
            try {
                this.GetUser([
                    {
                        value: loginAttempt[type], type
                    }
                ]).then(({ error, results }) => {
                    if (error) {
                        resolve({ error });
                    } else {
                        resolve({ error: null, results });
                    }
                })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static GetUser(identifiers, interator = null) {
        return new Promise(resolve => {
            try {
                let { sQuery, values } = this._buildQueryByIdentifiers(identifiers, interator);
                if (values.length == 0) {
                    resolve({ error: { status: 500, message: ['Fail to build query on GetUser'] } });
                    return;
                }
                query(sQuery, values)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static GetUserByCookie(cookie) {
        return new Promise(resolve => {
            try {
                query("SELECT * FROM `users` WHERE cookie=?;", [cookie])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    })

            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static SetCookie(user, cookie) {
        return new Promise(resolve => {
            try {
                query("UPDATE `users` SET cookie=? WHERE id=?;", [cookie, user])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    })

            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static _buildQueryByIdentifiers(identifiers, interator) {
        let sQuery = "SELECT * FROM `users` WHERE ";
        let values = [];
        for (let i = 0; i < identifiers.length; i++) {
            if (i > 0) interator ? sQuery += " " + interator + " " : sQuery += " ";

            sQuery += (identifiers[i].type + "=?");
            values.push(identifiers[i].value);

            if (i + 1 >= identifiers.length) sQuery += ";";
        }

        return { sQuery, values }
    }
}

module.exports = UserManager;