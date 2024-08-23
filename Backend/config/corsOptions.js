const allowedOrigins = require('./allowedOrigins');
const corsOptions = {
    origin:(origin, callback) =>{
        if(allowedOrigins.indexOf(origin)!= -1 || !origin){
            //!origin includes other sites like postman , thunder client who do not have origins

            callback(null, true)
        }else{
            callback(new Error(`CORS: ORIGIN: ${origin} NOT ALLOWED`), false);
        }   
    },
    credentials : true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;


// credentials key in cors option sets the 
// The Access-Control-Allow-Credentials response header tells browsers whether to expose the response to the frontend JavaScript code when the request's credentials mode (Request.credentials) is include.
