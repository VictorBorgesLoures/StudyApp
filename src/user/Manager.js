let Validators = require('./Validators');
let dbUserManager = require('../database/UserManager');
let bcrypt = require('bcrypt');

class UserManager {

    constructor(id) {
        this.user = this._getUser(id);
    }

    // To return user to frontend, dont escaping any important data
    static UserDisplay(user) {
        return {
            username: user.username,
            email: user.email,
        }
    }

    // To return user to frontend, dont escaping any important data
    static UserMinified(user) {
        return {
            username: user.username,
            email: user.email,
            admin: user.admin || false
        }
    }

    // Private function used only to check if the data of the login is valid
    static _checkLoginData(loginAttempt) {
        let errors = [];

        if (loginAttempt['username']) {
            if (!Validators.validUsername(loginAttempt['username'])) errors.push('Invalid username format');
        }

        if (loginAttempt['email']) {
            if (!Validators.validEmail(loginAttempt['email'])) errors.push('Invalid email format');
        }

        if (loginAttempt['password']) {
            if (!Validators.validPassword(loginAttempt['password'])) errors.push('Invalid password format');
        }

        return errors;

    }

    // Check Cookie from frontend and return user : Primise: Object {error, data}
    static CheckCookie(cookie) {
        return new Promise(async resolve => {
            try {
                let isValidCookie = Validators.validCookie(cookie) ? true : false;

                if (!isValidCookie) {
                    resolve({ error: { status: 400, message: ["Invalid cookie param data"] } });
                    return;
                };

                dbUserManager.GetUserByCookie(cookie)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            if (results.length == 0) {
                                resolve({ error: null, data: null });
                            } else {
                                resolve({ error: null, data: results[0] });
                            }
                        }
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
                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid user Identifier"] } });
                    return;
                };

                dbUserManager.getMetaData(userId)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            if (results.length == 0) {
                                resolve({ error: null, data: null });
                            } else {
                                resolve({ error: null, data: results[0] });
                            }
                        }
                    })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static setMetaData(userId, newData) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid user Identifier"] } });
                    return;
                }

                let data = JSON.stringify(newData);

                dbUserManager.setMetaData(userId, data)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            if (results.length == 0) {
                                resolve({ error: null, data: null });
                            } else {
                                resolve({ error: null, data: results[0] });
                            }
                        }
                    })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    // Bcrypt call to check passwordMatch : Promise
    static _passwordMatch(passwordAttempt, passwordHash) {
        return bcrypt.compare(passwordAttempt, passwordHash);
    }

    // Check login attempt : Promise : Object {error, data}
    static LoginAttempt(data) {
        return new Promise(async resolve => {

            try {
                // check if has any errors
                const errors = this._checkLoginData(data);
                if (errors.length > 0) {
                    return { error: { status: 404, message: errors } };
                } else {
                    // check login type : string
                    const type = this._typeOfLoginIdenfier(data);
                    // Do the login attempt using the right type from frontend;
                    dbUserManager.LoginAttempt(data, type)
                        .then(({ error, results }) => {
                            if (error) {
                                resolve({ error });
                            } else {
                                if (results.length == 0) {
                                    resolve({ error: { status: 404, message: ["Cannot find user"] } });
                                } else {
                                    this._passwordMatch(data.password, results[0].password)
                                        .then(isMatch => {
                                            // check if pasword match
                                            if (isMatch) {
                                                resolve({ error: null, data: results[0] });
                                            } else {
                                                resolve({ error: { status: 404, message: ["Password don't match"] } });
                                            }
                                        })
                                }
                            }
                        })
                }
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        })
    }

    // Set cookie on databa : boolean : Object {error, data}
    static SetCookie(user, cookie) {
        return new Promise(async resolve => {
            try {
                // Check if cookie is on valid format
                let isValidCookie = Validators.validCookie(cookie) ? true : false;

                if (!isValidCookie) {
                    resolve({ error: { status: 404, message: ["Invalid cookie format"] } })
                    return;
                }
                dbUserManager.SetCookie(user, cookie)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            if (results.affectedRows >= 1) {
                                resolve({ error: null, data: true })
                            } else {
                                resolve({ error: null, data: false })
                            }
                        }
                    });
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        })
    }

    // get type of login, email or username
    static _typeOfLoginIdenfier(data) {
        if (data["email"])
            return "email"
        if (data["username"])
            return "username"
        return null;
    }

    // Register form
    static RegisterAttempt(data) {
        return new Promise(resolve => {
            try {
                Promise.all(
                    [
                        this.GetUser([
                            {
                                value: data.username, type: 'username'
                            }
                        ]),
                        this.GetUser([
                            {
                                value: data.email, type: 'email'
                            }
                        ])
                    ]
                ).then(([username, email]) => {
                    if (username.error || email.error) {
                        resolve({ error: username.error || email.error });
                    } else {
                        if (!username.data && !email.data) {
                            dbUserManager.RegisterUser(data)
                                .then(({ error, results }) => {
                                    if (error) {
                                        resolve({ error });
                                    } else {
                                        resolve({ error: null, data: results.insertedId > 0 ? true : false });
                                    }
                                })
                        } else {
                            let message = [];
                            if (username.data) message.push("Username already exists");
                            if (email.data) message.push("Email already exists");
                            resolve({ error: { status: 409, message } })
                        }
                    }
                })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    // Get User
    static GetUser(identifiers, interator = null) {
        return new Promise(resolve => {
            try {
                dbUserManager.GetUser(identifiers, interator)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            if (results.length > 0) {
                                resolve({ error: null, data: results[0] });
                            } else {
                                resolve({ error: null, data: null });
                            }
                        }
                    })
            } catch (e) {
                console.log(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }
}

module.exports = UserManager;