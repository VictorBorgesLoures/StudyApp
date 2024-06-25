module.exports = function(server) {
    const routes = require('./routes/main');
    const middlewares = require('./middlewares/loader');
    
    middlewares(server);
    routes(server);
}