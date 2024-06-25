let UserManager = require('../../../src/user/Manager');

module.exports = function(router) {

    router.post('/register', function(req, res) {
        // TODO VALIDADE ALL DATA FROM REGISTER FORM
        UserManager.RegisterAttempt(req.body)
        .then(({error, data}) => {
            if(error) {
                console.log(error);
                res.status(200).json({action: 'register', data: { error }});
            } else {
                res.status(200).json({action: 'register', data: {error: null, data}});
            }
        })
    });

}