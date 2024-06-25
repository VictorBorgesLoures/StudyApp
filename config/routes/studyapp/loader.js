const express = require('express');

module.exports = function(router) {

    const userRouter = express.Router();
    
    require('./manager')(userRouter);

    router.use('/studyapp', userRouter);
}