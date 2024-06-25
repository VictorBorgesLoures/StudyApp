let userC = require('../../src/user/Manager');
let path = require('path');

module.exports = function (server) {
    const express = require('express');

    // setting static files
    server.use(express.static(path.join(__dirname, "..", "..", "public")));

    const router = express.Router();

    // Router filter
    router.use('*', async function (req, res, next) {
        // for all routes check if is xhr call from front end
        if (req.query.restfull == 'true') {
            // if front end trying to auth or logout user just do the route request
            if (req._parsedUrl.pathname == '/user/auth' || req._parsedUrl.pathname == '/user/logout') {
                next();
            } else {
                // if user already logued in: check  valid sessionId
                if (req.cookies.sessionId) {
                    userC.CheckCookie(req.cookies.sessionId).then(resp => {
                        if (resp.error) {
                            if (req._parsedUrl.pathname == '/user/login') {
                                //UserManager.SetCookie(data.id, null);
                                next();
                            } else {
                                // if error, logout route to clear cookie and after that will redirect to login page ( check /logout route );
                                res.status(200).json({ action: 'redirect', data: { error: { status: 500, message: ["Unbale to valid user"] }, to: "/logout" } });
                            }
                        } else {
                            // if has user: next route;
                            if (resp.data) {
                                res.locals.user = resp.data;
                                userC.getMetaData(resp.data.id)
                                    .then(response => {
                                        if (response.error) {
                                            res.status(200).json({ action: 'redirect', data: { error: { status: 500, message: ["Unbale to valid user"] }, to: "/logout" } });
                                        } else {
                                            try {
                                                res.locals.user.data = response.data != null ? JSON.parse(response.data.data) : {};
                                                next();
                                            } catch (e) {
                                                console.log(e);
                                                res.status(200).json({ action: 'redirect', data: { error: { status: 500, message: ["Fatal error Occours"] }, to: "/logout" } });
                                            }
                                        }
                                    });
                            } else {
                                // if invalid user session: redirect to logout
                                res.status(200).json({ action: 'redirect', data: { error: { status: 404, message: ["Invalid user session"] }, to: "/logout" } });
                            }
                        }
                    });
                } else {
                    // if not logued user, triyng to login or register, do route;
                    if (req._parsedUrl.pathname == '/user/login' || req._parsedUrl.pathname == '/user/register') {
                        next();
                    } else {
                        // user not logued- go to login page;
                        res.status(200).json({ action: 'redirect', data: { error: null, to: '/login' } });
                    }
                }
            }
        } else {
            // if not call from front end: render front end
            res.status(200).sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
        }

    });

    // - Loading routes
    //    User Router
    require('./user/loader')(router);
    require('./studyapp/loader')(router);

    server.use(router);
}