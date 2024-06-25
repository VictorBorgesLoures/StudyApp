class StudyAppManager {

    constructor() {
        if (this.constructor === UserManager) {
            throw new Error('Static class "UserManager" cannot be instantiated directly.');
        }
    }

    /*
    // GENERAL QUERIES
    static countCards(userId) {
        return new Promise(async resolve => {
            try {

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };
                dbStudyAppManager.countCards(userId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to Count Cards"] } });
                        } else {
                            resolve({ error: null, data: results[0] });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }
    */

    // SUBJECTS
    // Get all subjects from user
    static getUserSubjects(userId, parentId = null) {
        return new Promise(async resolve => {
            try {
                // Check if userId is valid number
                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.getUserSubjects(userId, parentId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to get Subjects List"] } });
                        } else {
                            resolve({ error: null, data: results });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static getSubjectById(userId, subjectId, parentId = null) {
        return new Promise(async resolve => {
            try {

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                if (!Validators.isInt(subjectId)) {
                    resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                    return;
                };

                if (parentId != null) {
                    if (!Validators.isInt(parentId)) {
                        resolve({ error: { status: 400, message: ["Invalid Parent Subject"] } });
                        return;
                    }
                }

                dbStudyAppManager.getSubjectById(userId, subjectId, parentId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to get Subject"] } });
                        } else {
                            resolve({ error: null, data: results[0] });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static RegisterSubject(userId, name, parentId = null) {
        return new Promise(async resolve => {
            try {
                if (!Validators.validSubject(name)) {
                    resolve({ error: { status: 400, message: ["Invalid subject format"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                if (parentId != null) {
                    if (!Validators.isInt(parentId)) {
                        resolve({ error: { status: 400, message: ["Invalid Parent Subject"] } });
                        return;
                    }
                }

                dbStudyAppManager.RegisterSubject(userId, name, parentId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to register Subject"] } });
                        } else {
                            resolve({ error: null, data: results.insertId });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static UpdateSubject(userId, name, subjectId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.validSubject(name)) {
                    resolve({ error: { status: 400, message: ["Invalid subject format"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                if (!Validators.isInt(subjectId)) {
                    resolve({ error: { status: 400, message: ["Invalid Parent Subject"] } });
                    return;
                }

                dbStudyAppManager.UpdateSubject(userId, name, subjectId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to update Subject"] } });
                        } else {
                            resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static deleteSubject(userId, subjectId, parentId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(subjectId)) {
                    resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                this.deleteAllCards(userId, subjectId, parentId).then(({ error, data }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to Delete Subject's Card"] } });
                    } else {
                        dbStudyAppManager.deleteSubject(userId, subjectId).then(({ error, results }) => {
                            if (error) {
                                Debug.message("----------------");
                                Debug.message("SQL ERROR");
                                Debug.message(error);
                                Debug.message("----------------");
                                resolve({ error: { status: 409, message: ["Fail to Delete Subject"] } });
                            } else {
                                resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                            }
                        });
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static deleteAllSubjects(userId, subjectId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(subjectId)) {
                    resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.getSubjectsByParentSubject(userId, subjectId).then(({ error, results }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to get Subjects to delete"] } });
                    } else {
                        let Promisses = [];
                        if (results.length > 0) {

                            for (let i = 0; i < results.length; i++) {
                                Promisses.push(this.deleteSubject(userId, results[i].id, results[i].parent_id))
                            }

                        }
                        Promise.all(Promisses).then(resp => {
                            let err = false;
                            for (let i = 0; i < resp.length; i++) {
                                const response = resp[i];
                                if (response.error) err = true;
                            }
                            if (err) {
                                resolve({ error: { status: 409, message: ["Fail to delete Subject's Subject"] } });
                            } else {
                                dbStudyAppManager.deleteSubject(userId, subjectId).then(({ error, results }) => {
                                    if (error) {
                                        Debug.message("----------------");
                                        Debug.message("SQL ERROR");
                                        Debug.message(error);
                                        Debug.message("----------------");
                                        resolve({ error: { status: 409, message: ["Fail to Delete Subject"] } });
                                    } else {
                                        resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                                    }
                                });
                            }
                        })
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    // CARDS
    static RegisterSubjectCard(userId, data) {
        return new Promise(async resolve => {
            try {

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                if (data.subject_id != null) {
                    if (!Validators.isInt(data.subject_id)) {
                        resolve({ error: { status: 400, message: ["Invalid Parent Subject"] } });
                        return;
                    }
                }

                dbStudyAppManager.RegisterSubjectCard(userId, data)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to register Subject's Cards"] } });
                        } else {
                            StudyAppManager.getSubjectCardById(userId, results.insertId).then(({ error, data }) => {
                                if (!error) {
                                    imageManager.updateImages(data);
                                }
                            })
                            resolve({ error: null, data: results.insertId });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static countSubjectCards(userId, parentId = null, subjectId = null, params = null) {
        return new Promise(async resolve => {
            try {

                if (!Validators.isInt(subjectId)) {
                    resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                    return;
                };

                if (parentId != null) {
                    if (!Validators.isInt(parentId)) {
                        resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                        return;
                    };
                }

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.countSubjectCards(userId, parentId, subjectId, params)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to list Subjects's Cards"] } });
                        } else {
                            resolve({ error: null, data: results[0] });
                        }
                    })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static getSubjectCards(userId, subjectId = null, prettify = false, parentId = null, params = null) {
        return new Promise(async resolve => {
            try {
                if (subjectId != null) {
                    if (!Validators.isInt(subjectId)) {
                        resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                        return;
                    };
                }

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.getSubjectCards(userId, subjectId, prettify, parentId, params)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to get Subject's Cards"] } });
                        } else {
                            resolve({ error: null, data: results });
                        }
                    })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    /*
    static _mountSubjectCard(userId, cardId) {
        return new Promise(async resolve => {
            try {
                dbStudyAppManager.getSubjectCardById(userId, cardId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to get Subject's Card"] }});
                        } else {
                            let card = results.length > 0 ? results[0] : null;
                            if (card) {
                                dbStudyAppManager.getSubjectCardQuestions(userId, cardId).then(resp => {
                                    if (resp.error) {
                                        Debug.message("----------------");
                                        Debug.message("SQL ERROR");
                                        Debug.message(error);
                                        Debug.message("----------------");
                                        resolve({ error: { status: 409, message: ["Fail to get Card's Questions"] }});
                                    } else {
                                        let questions = [];
                                        let data = {
                                            card,
                                            questions
                                        }
                                        data.questions = resp.results;
                                        resolve({ error: null, data });
                                    }
                                })
                            } else {
                                resolve({ error: { status: 400, message: ["Card not found"] } });
                            }
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }
    */

    static getSubjectCardById(userId, cardId, minified = true) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(cardId)) {
                    resolve({ error: { status: 400, message: ["Invalid Card"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.getSubjectCardById(userId, cardId)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to get Subject's Card"] } });
                        } else {
                            let card = results.length > 0 ? results[0] : null;
                            if (!minified) {
                                if (card) {
                                    dbStudyAppManager.getSubjectCardQuestions(userId, cardId).then(({ error, results }) => {
                                        if (error) {
                                            Debug.message("----------------");
                                            Debug.message("SQL ERROR");
                                            Debug.message(error);
                                            Debug.message("----------------");
                                            resolve({ error: { status: 409, message: ["Fail to register Card's Questions"] } });
                                        } else {
                                            let questions = [];
                                            let data = {
                                                card,
                                                questions
                                            }
                                            data.questions = results;
                                            resolve({ error: null, data });
                                        }
                                    })
                                } else {
                                    resolve({ error: { status: 400, message: ["Card not found"] } });
                                }
                            } else {
                                resolve({ error: null, data: card });
                            }
                        }
                    })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static updateCard(userId, cardId, data) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(cardId)) {
                    resolve({ error: { status: 400, message: ["Invalid Card"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.updateCard(userId, cardId, data).then(({ error, results }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to update Card"] } });
                    } else {
                        imageManager.updateImages({ id: cardId, title: data.title, text: data.text, summary: data.summary, user_id: userId });
                        resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static deleteCard(userId, cardId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(cardId)) {
                    resolve({ error: { status: 400, message: ["Invalid Card"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                this.deleteAllQuestions(userId, cardId).then(({ error, data }) => {
                    if (error) {
                        resolve({ error });
                    } else {
                        this.getSubjectCardById(userId, cardId).then(({ error, data }) => {
                            let err = error;
                            dbStudyAppManager.deleteCard(userId, cardId).then(({ error, results }) => {
                                if (error) {
                                    Debug.message("----------------");
                                    Debug.message("SQL ERROR");
                                    Debug.message(error);
                                    Debug.message("----------------");
                                    resolve({ error: { status: 409, message: ["Fail to delete Card"] } });
                                } else {
                                    if (!err && results.affectedRows > 0) {
                                        imageManager.deleteAllCardImages(data);
                                    }
                                    resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                                }
                            })
                        })
                    }
                })


            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static deleteAllCards(userId, subjectId, parentId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(subjectId)) {
                    resolve({ error: { status: 400, message: ["Invalid Subject"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                this.getSubjectCards(userId, subjectId, false, parentId, 0, null).then(({ error, data }) => {
                    if (error) {
                        resolve({ error });
                    } else {
                        let Promisses = [];

                        for (let i = 0; i < data.length; i++) {
                            Promisses.push(this.deleteCard(userId, data[i].id))
                        }

                        Promise.all(Promisses).then(resp => {
                            let err = false;
                            for (let i = 0; i < resp.length; i++) {
                                const response = resp[i];
                                if (response.error) err = true;
                            }
                            if (err) {
                                resolve({ error: { status: 409, message: ["Fail to delete Subject's Card"] } });
                            }
                            resolve({ error: null, data: true });
                        })
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    // card update review date
    static updateCardReviewDate(userId, cardId, reviewDate, newDate) {
        return new Promise(async resolve => {
            try {

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                }
                Debug.message("--------------------")
                Debug.message(reviewDate);
                Debug.message(newDate);
                Debug.message("--------------------")

                dbStudyAppManager.updateCardReviewDate(userId, cardId, reviewDate, newDate).then(({ error, results }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to update Card's review date"] } });
                    } else {
                        resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    // CARD QUESTIONS
    static RegisterSubjectCardQuestion(userId, cardId, data) {
        return new Promise(async resolve => {
            try {

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                if (cardId != null) {
                    if (!Validators.isInt(cardId)) {
                        resolve({ error: { status: 400, message: ["Invalid Card"] } });
                        return;
                    }
                }

                dbStudyAppManager.RegisterSubjectCardQuestion(userId, cardId, data)
                    .then(({ error, results }) => {
                        if (error) {
                            Debug.message("----------------");
                            Debug.message("SQL ERROR");
                            Debug.message(error);
                            Debug.message("----------------");
                            resolve({ error: { status: 409, message: ["Fail to register Card's question"] } });
                        } else {
                            resolve({ error: null, data: results.insertId });
                        }
                    })
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static updateCardQuestion(userId, cardId, data) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(cardId)) {
                    resolve({ error: { status: 400, message: ["Invalid Card"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.updateCardQuestion(userId, cardId, data).then(({ error, results }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to update Card's Question"] } });
                    } else {
                        resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static deleteCardQuestion(userId, questionId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(questionId)) {
                    resolve({ error: { status: 400, message: ["Invalid Card"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.deleteCardQuestion(userId, questionId).then(({ error, results }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to delete Card's Question"] }, data: null });
                    } else {
                        resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static deleteAllQuestions(userId, cardId) {
        return new Promise(async resolve => {
            try {
                if (!Validators.isInt(cardId)) {
                    resolve({ error: { status: 400, message: ["Invalid Card"] } });
                    return;
                };

                if (!Validators.isInt(userId)) {
                    resolve({ error: { status: 400, message: ["Invalid User"] } });
                    return;
                };

                dbStudyAppManager.deleteAllQuestions(userId, cardId).then(({ error, results }) => {
                    if (error) {
                        Debug.message("----------------");
                        Debug.message("SQL ERROR");
                        Debug.message(error);
                        Debug.message("----------------");
                        resolve({ error: { status: 409, message: ["Fail to delete Card's Questions"] }, data: null });
                    } else {
                        resolve({ error: null, data: results.affectedRows > 0 ? true : false });
                    }
                })

            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

}

module.exports = StudyAppManager;

let Validators = require('./Validators');
let dbStudyAppManager = require('../database/StudyAppManager');
let Debug = require('../debug/Debugger');
let imageManager = require('./ImageManager');