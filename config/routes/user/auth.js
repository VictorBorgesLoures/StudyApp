const userC = require('../../../src/user/Manager');

module.exports = function (router) {

    router.get('/auth', function (req, res) {
        userC.CheckCookie(req.cookies.sessionId).then(resp => {
            res.json(resp.data ? userC.UserMinified(resp.data) : resp.data );
        });
    });

}