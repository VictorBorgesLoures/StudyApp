let query = require('./connection').query;
let Debug = require('../debug/Debugger');

class StudyAppManager {

    constructor() {
        if (this.constructor === UserManager) {
            throw new Error('Static class "UserManager" cannot be instantiated directly.');
        }
    }

    static _buildParamsQuery(params, keys) {
        let paramsQuery = "";
        if (params) {
            if (params.searchText) {
                paramsQuery += " AND sc.title LIKE '%" + params.searchText + "%'";
            }
            if (params.orderBy) {
                paramsQuery += " ORDER BY ?";
                keys.push(params.orderBy);
            } else {
                paramsQuery += " ORDER BY `review_date` ASC";
            }
            if (params.pagination >= 0) {
                paramsQuery += " LIMIT ?";
                if (params.offSet >= 0) {
                    paramsQuery += ",?";
                    if (params.offSet > 0) {
                        keys.push(params.offSet);
                    } else {
                        keys.push(params.pagination * 15);
                    }
                }
                keys.push(15);
            } else {
                if (params.offSet >= 0) {
                    if (params.offSet > 0) {
                        paramsQuery += " OFFSET ?";
                        keys.push(params.offSet);
                    }
                }
            }
        }
        return paramsQuery;
    }

    /*
    // GENERAL QUERIES
    static countCards(userId) {
        return new Promise(async resolve => {
            try {
                let initQuery = "SELECT COUNT(id) as cards_quantity FROM `subjects` WHERE user_id=?";
                let endQuery = ";";
                query(initQuery + endQuery, [userId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }
    */

    // SUBJECTS
    static getUserSubjects(userId, parentId) {
        return new Promise(async resolve => {
            try {
                let initQuery = "SELECT s.* FROM `subjects` as s WHERE s.user_id=? AND s.parent_id";
                parentId == null ? initQuery += " IS NULL" : initQuery += "=?";
                let endQuery = " ORDER BY s.name;";
                query(initQuery + endQuery, [userId, parentId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static getSubjectById(userId, subjectId, parentId = null) {
        return new Promise(async resolve => {
            try {
                let initQuery = "SELECT * FROM `subjects` WHERE `user_id`=? AND `id`=? AND `parent_id`";
                parentId == null ? initQuery += " IS NULL" : initQuery += "=?";
                let endQuery = ";";
                query(initQuery + endQuery, [userId, subjectId, parentId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static RegisterSubject(userId, name, parentId) {
        return new Promise(async resolve => {
            try {
                query("INSERT INTO `subjects` (`user_id`,`name`,`parent_id`) values(?,?,?);", [userId, name, parentId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static UpdateSubject(userId, name, subjectId) {
        return new Promise(async resolve => {
            try {

                query("UPDATE `subjects` SET `name`=? WHERE `user_id`=? AND `id`=?;", [name, userId, subjectId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static getSubjectsByParentSubject(userId, subjectId) {
        return new Promise(async resolve => {
            try {
                query("SELECT * FROM `subjects` WHERE `user_id`=? AND `parent_id`=?;", [userId, subjectId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static deleteSubject(userId, subjectId) {
        return new Promise(async resolve => {
            try {
                query("DELETE FROM `subjects` WHERE `user_id`=? AND `id`=?;", [userId, subjectId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    // CARDS
    static _getAllCards() {
        return new Promise(async resolve => {
            try {
                query("SELECT * FROM `subjects_card`;")
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });


            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static RegisterSubjectCard(userId, data) {
        return new Promise(async resolve => {
            try {

                query("INSERT INTO `subjects_card` (`user_id`,`subject_id`,`title`,`summary`,`text`) values(?,?,?,?,?);", [userId, data.subject_id, data.title, data.summary, data.text])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static countSubjectCards(userId, parentId, subjectId, params) {
        return new Promise(async resolve => {
            try {

                let queryString = "SELECT COUNT(sc.id) as cards_quantity FROM `subjects_card` as sc";
                let paramsQuery = ""
                let keys = [];

                if (subjectId) {
                    // if parentId -- just get id = subjectId WHERE subject_id=? [subjectId]
                    queryString += " WHERE sc.user_id=? AND sc.subject_id=?"
                    keys.push(userId);
                    keys.push(subjectId);
                } else {
                    // else inner join `subjects` as s ON s.parent_id=? 
                    if (parentId == null) {
                        queryString += " WHERE sc.user_id=?";
                        keys.push(userId);
                    } else {
                        queryString += " INNER JOIN `subjects` as s ON sc.user_id=? AND s.parent_id=? AND sc.subject_id=s.id";
                        keys.push(userId);
                        keys.push(parentId);
                    }
                }

                if (params) {
                    if (params.searchText) {
                        paramsQuery += " AND sc.title LIKE '%" + params.searchText + "%'";
                    }
                    if (params.orderBy) {
                        paramsQuery += " ORDER BY ?";
                        keys.push(params.orderBy);
                    } else {
                        paramsQuery += " ORDER BY `review_date` ASC";
                    }
                }
                paramsQuery += ";";

                query(queryString + paramsQuery, keys)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });


            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static getSubjectCards(userId, subjectId, prettify, parentId, params) {
        return new Promise(async resolve => {
            try {

                let initQuery = "";
                let keys = [];
                let paramsQuery = "";

                if (subjectId == null && parentId == null) {
                    // Both null, get all cards from user id
                    if (prettify) {
                        // prettify === render on table
                        initQuery += "SELECT sc.id, s.name as subject_name, sc.title, sc.created_at, sc.last_review_date, sc.review_date, sc.subject_id, s.parent_id as parent_id FROM `subjects_card` as sc INNER JOIN `subjects` as s ON sc.subject_id=s.id AND sc.user_id=?"
                        keys.push(userId);
                    } else {
                        // just regular data
                        initQuery += "SELECT sc.* FROM `subjects_card` as sc WHERE sc.user_id=?";
                        keys.push(userId);
                    }
                } else {
                    if (parentId) {
                        // If parent Id === is sub subject -- just get where id = subject id
                        if (prettify) {
                            // pretify === Inner, bring name os subject_id by inner table
                            initQuery += "SELECT sc.id, s.name as subject_name, sc.title, sc.created_at, sc.last_review_date, sc.review_date, sc.subject_id, s.parent_id as parent_id FROM `subjects_card` as sc INNER JOIN `subjects` as s ON sc.subject_id=s.id AND sc.user_id=? AND sc.subject_id=?"
                            keys.push(userId);
                            keys.push(subjectId);
                        } else {
                            initQuery += "SELECT sc.* FROM `subjects_card` as sc WHERE sc.user_id=? AND sc.subject_id=?"
                            keys.push(userId);
                            keys.push(subjectId);
                        }
                    } else {
                        // if Not parent === is subject --- inner right subjects table ON parent_id == subjects.id
                        if (prettify) {
                            // pretify === Inner, bring name of subject_id by inner table
                            initQuery += "SELECT sc.id, s.name as subject_name, sc.title, sc.created_at, sc.last_review_date, sc.review_date, sc.subject_id, s.parent_id as parent_id FROM `subjects_card` as sc INNER JOIN `subjects` as s ON sc.user_id=? AND s.parent_id=? AND sc.subject_id=s.id";
                        } else {
                            initQuery += "SELECT sc.* FROM `subjects_card` as sc INNER JOIN `subjects` as s ON sc.user_id=? AND s.parent_id=? AND sc.subject_id=s.id";
                        }
                        keys.push(userId);
                        keys.push(subjectId);
                    }
                }

                if (params) {
                    paramsQuery = this._buildParamsQuery(params, keys);
                }
                paramsQuery += ";";

                query(initQuery + paramsQuery, keys)
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {

                            resolve({ error: null, results });
                        }
                    });


            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static getSubjectCardById(userId, cardId) {
        return new Promise(async resolve => {
            try {
                query("SELECT * FROM `subjects_card` WHERE `user_id`=? AND `id`=?", [userId, cardId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });


            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static updateCard(userId, cardId, data) {
        return new Promise(async resolve => {
            try {
                query("UPDATE `subjects_card` SET `title`=?, `summary`=?, `text`=? WHERE `user_id`=? AND `id`=?;", [data.title, data.summary, data.text, userId, cardId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static deleteCard(userId, cardId) {
        return new Promise(async resolve => {
            try {
                query("DELETE FROM `subjects_card` WHERE `user_id`=? AND `id`=?;", [userId, cardId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    // update review date
    static updateCardReviewDate(userId, cardId, reviewDate, newDate) {
        return new Promise(async resolve => {
            try {
                query("UPDATE `subjects_card` SET `last_review_date`=?,`review_date`=?  WHERE `user_id`=? AND `id`=?;", [reviewDate, newDate, userId, cardId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    // CARD QUESTIONS
    static getSubjectCardQuestions(userId, cardId) {
        return new Promise(async resolve => {
            try {

                query("SELECT * FROM `subjects_card_question` WHERE `user_id`=? AND `subject_card_id`=? ORDER BY `created_at`;", [userId, cardId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });


            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }

        });
    }

    static RegisterSubjectCardQuestion(userId, cardId, data) {
        return new Promise(async resolve => {
            try {

                query("INSERT INTO `subjects_card_question` (`user_id`,`subject_card_id`,`question`,`answer`,`type`) values(?,?,?,?,?);", [userId, cardId, data.question, data.answer, data.type])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static updateCardQuestion(userId, cardId, data) {
        return new Promise(async resolve => {
            try {
                query("UPDATE `subjects_card_question` SET `question`=?, `answer`=?, `type`=? WHERE `user_id`=? AND `subject_card_id`=? AND `id`=?;", [data.question, data.answer, data.type, userId, cardId, data.id])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static deleteCardQuestion(userId, questionId) {
        return new Promise(async resolve => {
            try {
                query("DELETE FROM `subjects_card_question` WHERE `user_id`=? AND `id`=?;", [userId, questionId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

    static deleteAllQuestions(userId, cardId) {
        return new Promise(async resolve => {
            try {
                query("DELETE FROM `subjects_card_question` WHERE `user_id`=? AND `subject_card_id`=?;", [userId, cardId])
                    .then(({ error, results }) => {
                        if (error) {
                            resolve({ error });
                        } else {
                            resolve({ error: null, results });
                        }
                    });
            } catch (e) {
                Debug.message(e);
                resolve({ error: { status: 500, message: ["An unexpected error occours"] } })
            }
        });
    }

}

module.exports = StudyAppManager;