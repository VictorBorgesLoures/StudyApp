let UserManager = require('../../../src/user/Manager');
let generators = require('../../../src/helpers/Generators');

module.exports = function (router) {

    router.post('/login', async function (req, res) {

        UserManager.LoginAttempt(req.body)
            .then(async ({ error, data }) => {

                if (error) {
                    res.status(200).json({ action: "login", data: { error } });
                    return;
                }

                let token = await generators.generateToken(data.password);
                
                data.cookie = token;
                UserManager.SetCookie(data.id, token).then(resp => {
                    if(resp) {
                        data = UserManager.UserMinified(data);
                        res.cookie("sessionId", token, {
                            expires: generators.expireGeneratorByDays(20),
                            httpOnly: false,
                            path: '/'
                        }).status(200).status(200).json({ action: "login", data: { error: null, user: data } });
                    } else {
                        res.status(400).json({ action: "redirect", data: { error: { status: 400, message: ["Unable to login"] } , to: "/login" } });
                    }
                })

            })
            .catch(e => {
                console.log(e);
                res.status(200).json({ action: "login", data: { error: { status: 500, message: ["An unexpeted error ocours"] } } });
            });

    });

    router.get('/logout', function (req, res) {
        UserManager.CheckCookie(req.cookies.sessionId)
            .then(({ error, data }) => {
                if (!error) {
                    if (data != null) {
                        UserManager.SetCookie(data.id, null);
                    }
                }
                res.cookie("sessionId", '', { expires: new Date(0) }).status(200).json({ action: "redirect", data: { error: null ,to: "/login" } });
            })
            .catch(e => {
                console.log(e);
                res.cookie("sessionId", '', { expires: new Date(0) }).status(200).json({ action: "redirect", data: { error: { status: 500, message: ["An unexpeted error ocours"] }, to:"/login" } });
            });
    });

}