const express = require('express');

module.exports = function(router) {

    const userRouter = express.Router();
    
    require('./auth')(userRouter);
    require('./login')(userRouter);
    require('./register')(userRouter);

    router.use('/user', userRouter);
}