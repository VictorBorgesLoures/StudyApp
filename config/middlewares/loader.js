module.exports = function(server) {

    const bodyParser = require('body-parser');
    const allowCors = require('./cors');
    const cookieParser = require('cookie-parser');
    //const helmet = require('helmet');

    //server.use(helmet());

    server.use(cookieParser());

    server.use(bodyParser.urlencoded({limit: '50mb', extended: true }))
    server.use(bodyParser.json({limit: '50mb', extended: true}));
    server.use(allowCors);

}