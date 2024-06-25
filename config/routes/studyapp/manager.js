const studyAppManager = require('../../../src/studyapp/Manager');
const Validators = require('../../../src/studyapp/Validators');
const Debug = require('../../../src/debug/Debugger');

module.exports = function (router) {

    // Setting promisses filter - FINISHED
    router.use(function (req, res, next) {
        Debug.cut();
        Debug.message(res.locals);
        Debug.message("MIDDLEWARE: INIT");
        Debug.message("MIDDLEWARE: REQ.LOCALS.STUDY APP");
        res.locals.studyapp = {};
        res.locals.studyapp.promisses = [];
        res.locals.params = {}
        if (req.query.page) {
            res.locals.params.pagination = Validators.isInt(req.query.page) ? parseInt(req.query.page) : 0;
        } else {
            res.locals.params.pagination = 0;
        }

        if (req.query.offSet) {
            res.locals.params.offSet = Validators.isInt(req.query.offSet) ? parseInt(req.query.offSet) : 0;
        } else {
            res.locals.params.offSet = 0;
        }

        res.locals.params.searchText = req.query.searchText || "";

        Debug.message("----");
        Debug.message("-- Params --");
        Debug.message(res.locals.params);
        Debug.message("----");
        next();
    });

    // Home data

    router.get('/', function (req, res) {
        Debug.message("GET: GERNERAL DATA");
        studyAppManager.countSubjectCards(res.locals.user.id)
            .then(resp => {
                let params = res.locals.params;
                if (resp.error) {
                    Debug.message("GET: CARDS QUANTITY ERROR");
                    Debug.message("GET: REDIRECT TO /studyapp");
                    Debug.message(resp.error);
                    Debug.cut();
                    res.status(200).json({ action: "redirect", data: { error: resp.error }, to: "/studyapp" });
                    return;
                } else {
                    Debug.message('----');
                    Debug.message("-- CARDS QUANTITY DATA --");
                    Debug.message(resp.data);
                    Debug.message('----');
                    let maxPages = Math.ceil(resp.data.cards_quantity / 15);
                    if (params.pagination > maxPages - 1) {
                        params.pagination = maxPages - 1 > 0 ? maxPages - 1 : 0;
                    } else {
                        if (params.pagination < 0) {
                            params.pagination = 0;
                        }
                    }
                }
                let Promisses = [];
                Promisses.push(studyAppManager.getSubjectCards(res.locals.user.id, null, true, null, params));
                Promise.all(Promisses).then(response => {
                    let data = { cardsQuantity: resp.data.cards_quantity, userMetaData: res.locals.user.data }
                    for (let i = 0; i < response.length; i++) {
                        const element = response[i];
                        if (i == 0) {
                            data.cards = element.data;
                        }
                    }
                    Debug.cut();
                    Debug.message("DATA");
                    Debug.message(data);
                    Debug.cut();
                    res.status(200).json({ action: 'get', data: { error: null, data } });
                })
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] }, to: "/studyapp" } });
            })
    });

    router.post('/images', (req, res, next) => {
        var base64Data = req.body.cardsimages.replace(/^data:image\/(png|jpeg);base64,/, "");
        let date = Date.now();
        require("fs").writeFile("public/images/cards/"+date + "-cardsimages" + ".png", base64Data, 'base64', function (err) {
            if (!err) {
                res.status(200).json({ action: "data", data: { error: null, data: { imageName: date + "-cardsimages" + ".png" } } });
            } else {
                res.status(200).json({ action: "data", data: { error: { status: 400, message: ["Fail to insert img"] }, data: null } });
            }
        });
    });


    // menu build - FINISHED
    router.get('/subjects', function (req, res) {
        Debug.cut();
        Debug.message("INIT: Subjects Route");
        studyAppManager.getUserSubjects(res.locals.user.id)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "get", data: { error } });
                    }
                    Debug.cut();
                } else {
                    function mapSubMenus(element) {
                        element.subMenu = [];
                        return studyAppManager.getUserSubjects(res.locals.user.id, element.id).then(resp => {
                            if (!resp.error) {
                                element.subMenu = resp.data;
                            }
                        });
                    }

                    Promise.all(data.map(mapSubMenus))
                        .then(resp => {
                            Debug.message("FINISH: Subjects Route");
                            Debug.cut();
                            res.status(200).json({ action: "get", data: { error: null, data } });
                        })
                        .catch(e => {
                            Debug.cut();
                            Debug.message("FATAL ERROR");
                            Debug.message(e);
                            Debug.cut();
                            res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
                        })
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    });

    // Subject Filter - FINISHED
    router.all('/subject/:subjectId*', function (req, res, next) {
        Debug.message("MIDDLEWARE: SUBJECT PARAM");
        if (req.params.subjectId == 'card') {
            next();
            return;
        }
        try {
            req.params.subjectId = parseInt(req.params.subjectId);
        } catch (error) {
            Debug.message(error);
            Debug.cut();
            res.status(200).json({ action: "redirect", data: { error: { status: 400, message: ["Invalid Subject"] }, to: "/studyapp" } });
            return;
        }
        res.locals.studyapp.promisses.push(studyAppManager.getSubjectById(res.locals.user.id, req.params.subjectId));
        next();
    });

    // Sub Subject Filter - FINISHED
    router.all('/subject/:subjectId/:subSubjectId*', function (req, res, next) {
        Debug.message("MIDDLEWARE: SUB SUBJECT PARAM");
        try {
            req.params.subSubjectId = parseInt(req.params.subSubjectId);
        } catch (error) {
            Debug.message(error);
            Debug.cut();
            res.status(200).json({ action: "redirect", data: { error: { status: 400, message: ["Invalid Subject"] }, to: "/studyapp/" } });
            return;
        }
        res.locals.studyapp.promisses.push(studyAppManager.getSubjectById(res.locals.user.id, req.params.subSubjectId, req.params.subjectId));
        next();
    });

    // Card filter - FINISHED
    router.all('/subject/:subjectId/:subSubjectId/card/:cardId*', function (req, res, next) {
        Debug.message("MIDDLEWARE: CARD PARAM");
        try {
            req.params.cardId = parseInt(req.params.cardId);
        } catch (error) {
            Debug.message(error);
            Debug.cut();
            res.status(200).json({ action: "redirect", data: { error: { status: 400, message: ["Invalid Card"] }, to: "/studyapp" } });
            return;
        }
        res.locals.studyapp.promisses.push(studyAppManager.getSubjectCardById(res.locals.user.id, req.params.cardId));
        next();
    });

    // Promisses Filter - FINISHED
    router.use(function (req, res, next) {
        Debug.message("MIDDLEWARE: PROMISSES CHECK - LENGTH:" + res.locals.studyapp.promisses.length);
        if (res.locals.studyapp.promisses.length > 0) {
            Promise.all(res.locals.studyapp.promisses)
                .then(resp => {
                    for (let i = 0; i < resp.length; i++) {
                        const element = resp[i];
                        if (i == 0) {
                            if (!element.error) {
                                res.locals.studyapp.subject = element.data;
                            } else {
                                Debug.message("ERROR: FAILED MIDDLEWARE SUBJECT PARAM");
                                Debug.message("ERROR: REDIRECT TO /studyapp");
                                Debug.message(element.error);
                                Debug.cut();
                                res.status(200).json({ action: "redirect", data: { error: { status: 404, message: ["Unable to find Subject"] }, to: "/studyapp" } });
                                return;
                            }
                        }

                        if (i == 1) {
                            if (!element.error) {
                                res.locals.studyapp.subSubject = element.data;
                            } else {
                                Debug.message("ERROR: FAILED MIDDLEWARE SUB SUBJECT PARAM");
                                Debug.message("ERROR: REDIRECT TO /studyapp");
                                Debug.message(element.error);
                                Debug.cut();
                                res.status(200).json({ action: "redirect", data: { error: { status: 404, message: ["Unable to find Subject"] }, to: "/studyapp" } });
                                return;
                            }
                        }

                        if (i == 2) {
                            if (!element.error) {
                                res.locals.studyapp.card = element.data;
                            } else {
                                Debug.message("ERROR: FAILED MIDDLEWARE CARD PARAM");
                                Debug.message("ERROR: REDIRECT TO /studyapp");
                                Debug.message(element.error);
                                Debug.cut();
                                res.status(200).json({ action: "redirect", data: { error: { status: 404, message: ["Unable to find Card"] }, to: "/studyapp" } });
                                return;
                            }
                        }
                    }
                    res.locals.studyapp.promisses = [];
                    Debug.message("MIDDLEWARE: FINISH");
                    Debug.cut();
                    next();
                })
                .catch(e => {
                    Debug.cut();
                    Debug.message("FATAL ERROR");
                    Debug.message(e);
                    Debug.cut();
                    res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] }, to: "/studyapp" } });
                })
        } else {

            Debug.message("MIDDLEWARE: FINISH");
            Debug.cut();
            next();
        }
    });

    // CARD DELETE - FINISHED
    router.delete('/subject/card', function (req, res) {
        Debug.message("DELETE: CARD");
        studyAppManager.deleteCard(res.locals.user.id, req.body.id)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    Debug.message(data);
                    Debug.cut();
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Card Removed"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 406, message: ["Couldn't remove Card"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    });

    // Subject Routes

    // Adding new Subject ----- FINISHED
    router.post('/subject/:subjectId?', function (req, res) {
        Debug.message("POST: SUBJECT OR SUB SUBJECT");
        studyAppManager.RegisterSubject(res.locals.user.id, req.body.name, res.locals.studyapp.subject ? res.locals.studyapp.subject.id : null)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    Debug.message("REDIRECT > 0 : " + data);
                    Debug.cut();
                    if (data > 0) {
                        let redirect = req.params.subjectId ? "/studyapp/subject/" + req.params.subjectId + "/" + data : "/studyapp/subject/" + data;
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Subject registred with success!"], to: redirect });
                    } else {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Failed to register new subject"] });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    })

    // Editing subject --- FINISHED
    router.put('/subject/:subjectId/:subSubjectId?', function (req, res) {
        Debug.message("PUT: SUBJECT OR SUB SUBJECT");
        let id = res.locals.studyapp.subSubject ? res.locals.studyapp.subSubject.id : res.locals.studyapp.subject.id;
        studyAppManager.UpdateSubject(res.locals.user.id, req.body.name, id)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    Debug.message("REDIRECT " + data);
                    if (data) {
                        let redirect = res.locals.studyapp.subSubject ? "/studyapp/subject/" + res.locals.studyapp.subject.id + "/" + res.locals.studyapp.subSubject.id : "/studyapp/subject/" + res.locals.studyapp.subject.id;
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Subject updated with success!"], to: redirect });
                    } else {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Failed to edit subject"] });
                    }
                    Debug.cut();
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    })

    // Getting data - General cards, Subject's Card or Sub Subject' Card --- FINISHED
    router.get('/subject/:subjectId/:subSubjectId?', function (req, res) {

        Debug.message("GET: SUBJECT OR SUB SUBJECT");
        let subjectCardsPromise;
        let title = "Geral";

        let subject = null;
        if (req.params.subjectId != 'card') {
            subject = res.locals.studyapp.subject.id;
        }

        studyAppManager.countSubjectCards(res.locals.user.id, subject, res.locals.studyapp.subSubject ? res.locals.studyapp.subSubject.id : null, res.locals.params)
            .then(resp => {
                let params = res.locals.params;
                if (resp.error) {
                    Debug.message("GET: CARDS QUANTITY ERROR");
                    Debug.message("GET: REDIRECT TO /studyapp");
                    Debug.message(resp.error);
                    Debug.cut();
                    res.status(200).json({ action: "redirect", data: { error: resp.error }, to: "/studyapp" });
                    return;
                } else {
                    Debug.message('----');
                    Debug.message("-- CARDS QUANTITY DATA --");
                    Debug.message(resp.data);

                    if (resp.data.cards_quantity == 0) {
                        if (res.locals.studyapp.subSubject) {
                            title = res.locals.studyapp.subSubject.name;
                        } else if (req.params.subjectId != 'card') {
                            title = res.locals.studyapp.subject.name;
                        }

                        Debug.message("FAST FINISH 0 CARDS");
                        Debug.cut();
                        res.status(200).json({ action: "get", data: { error: null, data: { cards: [], title, cardsQuantity: resp.data.cards_quantity } } });
                        return;
                    }

                    Debug.message('----');
                    let maxPages = Math.ceil(resp.data.cards_quantity / 15);
                    if (params.pagination > maxPages - 1) {
                        params.pagination = maxPages - 1 > 0 ? maxPages - 1 : 0;
                    } else {
                        if (params.pagination < 0) {
                            params.pagination = 0;
                        }
                    }
                }


                if (res.locals.studyapp.subSubject) {
                    title = res.locals.studyapp.subSubject.name;
                    subjectCardsPromise = studyAppManager.getSubjectCards(res.locals.user.id, res.locals.studyapp.subSubject.id, true, res.locals.studyapp.subject.id, params);
                } else {
                    if (req.params.subjectId != 'card') {
                        title = res.locals.studyapp.subject.name;
                    }
                    subjectCardsPromise = studyAppManager.getSubjectCards(res.locals.user.id, subject, true, null, params);
                }

                subjectCardsPromise
                    .then(({ error, data }) => {
                        if (error) {
                            Debug.message(error);
                            Debug.cut();
                            let redirect = "/studyapp" + (res.locals.studyapp.subSubject ? "/subject/" + res.locals.studyapp.subject.id : "");
                            res.status(200).json({ action: "redirect", data: { error }, to: redirect });
                        } else {
                            Debug.message({ cards: data, title, cardsQuantity: resp.data.cards_quantity });
                            Debug.cut();
                            res.status(200).json({ action: "get", data: { error: null, data: { cards: data, title, cardsQuantity: resp.data.cards_quantity } } });
                        }
                    })
                    .catch(e => {
                        Debug.cut();
                        Debug.message("FATAL ERROR");
                        Debug.message(e);
                        Debug.cut();
                        let redirect = "/studyapp" + (res.locals.studyapp.subSubject ? "/subject/" + res.locals.studyapp.subject.id : "");
                        res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] }, to: redirect } });
                    })
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] }, to: "/studyapp" } });
            })

    });

    // Deleting Subject or Sub Subject --- FINISHED
    router.delete('/subject/:subjectId/:subSubjectId?', function (req, res) {
        if (res.locals.studyapp.subSubject) {
            Debug.message("DELETE: SUB SUBJECT");
            studyAppManager.deleteSubject(res.locals.user.id, res.locals.studyapp.subSubject.id, res.locals.studyapp.subject.id)
                .then(({ error, data }) => {
                    if (error) {
                        Debug.message(error);
                        Debug.cut();
                        if (error.status == 500) {
                            res.status(200).json({ action: "fatal-error", data: { error } });
                        } else {
                            res.status(200).json({ action: "data", data: { error } });
                        }
                    } else {
                        Debug.message("T-REDIRECT || F-REFRESH : " + data);
                        if (data) {
                            res.status(200).json({ action: "data", data: { error: null, data }, message: ["Subject deleted with success!"], to: '/studyapp/subject/' + res.locals.studyapp.subject.id });
                        } else {
                            res.status(200).json({ action: "data", data: { error: null, data }, message: ["Fail to delete Subject"] });
                        }
                        Debug.cut();
                    }
                })
                .catch(e => {
                    Debug.cut();
                    Debug.message("FATAL ERROR");
                    Debug.message(e);
                    Debug.cut();
                    res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
                })
        } else {
            Debug.message("DELETE: SUBJECT");
            studyAppManager.deleteAllSubjects(res.locals.user.id, res.locals.studyapp.subject.id)
                .then(({ error, data }) => {
                    if (error) {
                        Debug.message(error);
                        Debug.cut();
                        if (error.status == 500) {
                            res.status(200).json({ action: "fatal-error", data: { error } });
                        } else {
                            res.status(200).json({ action: "data", data: { error } });
                        }
                    } else {
                        Debug.message("T-REDIRECT || F-REFRESH : " + data);
                        if (data) {
                            res.status(200).json({ action: "data", data: { error: null, data }, message: ["Subject deleted with success!"], to: '/studyapp' });
                        } else {
                            res.status(200).json({ action: "data", data: { error: null, data }, message: ["Fail to delete Subject"] });
                        }
                        Debug.cut();
                    }
                })
                .catch(e => {
                    Debug.cut();
                    Debug.message("FATAL ERROR");
                    Debug.message(e);
                    Debug.cut();
                    res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
                })
        }

    });

    // Cards Routes

    // Getting data of card - FINISHED
    router.get('/subject/:subjectId/:subSubjectId/card/:cardId', function (req, res) {
        Debug.message("GET: CARD")
        studyAppManager.getSubjectCardById(res.locals.user.id, res.locals.studyapp.card.id, false)
            .then(({ error, data }) => {
                if (error) {
                    let redirect = "/studyapp/subject/" + res.locals.studyapp.subject.id + "/" + res.locals.studyapp.subSubject.id;
                    Debug.message("GET: REDIRECT TO " + redirect);
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error }, to: redirect });
                    } else {
                        res.status(200).json({ action: "redirect", data: { error }, to: redirect });
                    }
                } else {
                    Debug.message(data);
                    Debug.cut();
                    res.status(200).json({ action: "get", data: { error: null, data } });
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                let redirect = "/studyapp/subject/" + res.locals.studyapp.subject.id + "/" + res.locals.studyapp.subSubject.id;
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] }, to: redirect } });
            })
    });

    // New Card - FINISHED
    router.post('/subject/:subjectId/:subSubjectId/card', function (req, res) {
        Debug.message("POST: CARD");
        req.body.subject_id = res.locals.studyapp.subSubject.id;
        Debug.message("----");
        Debug.message("-- DATA --");
        Debug.message(req.body);
        Debug.message("----");
        studyAppManager.RegisterSubjectCard(res.locals.user.id, req.body)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    Debug.message(data);
                    Debug.cut();
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Card registred with success!"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 304, message: ["Failed to create Card"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    })

    // Editing Card - FINISHED
    router.put('/subject/:subjectId/:subSubjectId/card/:cardId', function (req, res) {
        Debug.message("PUT: CARD");
        studyAppManager.updateCard(res.locals.user.id, res.locals.studyapp.card.id, req.body)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                    Debug.cut();
                } else {
                    Debug.message(data);
                    Debug.cut();
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Card Updated"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 304, message: ["Failed to update card"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    });

    // Updating Review Date Card - FINISHED
    router.put('/subject/:subjectId/:subSubjectId/card/:cardId/reviewdate', function (req, res) {
        Debug.message("PUT: CARD REVIEW DATE");
        studyAppManager.updateCardReviewDate(res.locals.user.id, res.locals.studyapp.card.id, req.body.reviewDate, req.body.newDate)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    // Check data true or false;
                    Debug.message(data);
                    Debug.cut();
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Review date Updated with success!"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 304, message: ["Failed to update review date"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    });

    // POST CARD QUESTION - FINISHED
    router.post('/subject/:subjectId/:subSubjectId/card/:cardId/question', function (req, res) {
        Debug.message("POST: CARD QUESTION");
        studyAppManager.RegisterSubjectCardQuestion(res.locals.user.id, res.locals.studyapp.card.id, req.body)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    Debug.message(data);
                    Debug.cut();
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Question registred with success!"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 304, message: ["Failed to register review date"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })

    })

    // EDIT CARD QUESTION - FINISHED
    router.put('/subject/:subjectId/:subSubjectId/card/:cardId/question', function (req, res) {
        Debug.message("PUT: CARD QUESTION");
        studyAppManager.updateCardQuestion(res.locals.user.id, res.locals.studyapp.card.id, req.body)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    Debug.message(data);
                    Debug.cut();
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Question Updated with success!"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 304, message: ["Failed to update Question"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    });

    // DELETE CARD QUESTION - FINISHED
    router.delete('/subject/:subjectId/:subSubjectId/card/:cardId/question', function (req, res) {
        Debug.message("DELETE: CARD QUESTION");
        studyAppManager.deleteCardQuestion(res.locals.user.id, req.body.id)
            .then(({ error, data }) => {
                if (error) {
                    Debug.message(error);
                    Debug.cut();
                    if (error.status == 500) {
                        res.status(200).json({ action: "fatal-error", data: { error } });
                    } else {
                        res.status(200).json({ action: "data", data: { error } });
                    }
                } else {
                    if (data) {
                        res.status(200).json({ action: "data", data: { error: null, data }, message: ["Question Removed"] });
                    } else {
                        res.status(200).json({ action: "data", data: { error: { status: 500, message: ["Failed to remove Question"] }, data } });
                    }
                }
            })
            .catch(e => {
                Debug.cut();
                Debug.message("FATAL ERROR");
                Debug.message(e);
                Debug.cut();
                res.status(200).json({ action: "fatal-error", data: { error: { status: 500, message: ["An unexpected error occours"] } } });
            })
    });
}