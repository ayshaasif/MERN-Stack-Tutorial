const {logEvents} = require('./logger');

const errorHandler = (err,req,res,next)=>{
    let message = `${err.name}:\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
    logEvents(message, 'errLog.log');
    console.log(err.stack);

    const status = res
}

module.exports = {errorHandler};