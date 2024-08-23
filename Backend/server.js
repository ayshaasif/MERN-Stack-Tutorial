require('dotenv').config()
const express = require('express');
const app = express()
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const corsOptions  = require('./config/corsOptions');
const cors = require('cors')
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const {logger , logEvents} = require('./middleware/logger');
const PORT = process.env.PORT || 3500;

connectDB()
console.log("connected")
app.use(logger);

// console.log('logger done ....')
// built in middle ware for handling json 
app.use(express.json());


// built-in middle-ware for cookies
app.use(cookieParser());


// CORS - Cross Site Allowed Origins handling
app.use(cors(corsOptions));
app.use('/', express.static(path.join(__dirname,'public')));
// console.log('cors done ....')

app.use('/',require('./routes/root'));
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

console.log('routes done ....')

app.get('*',(req,res)=>{
    if (req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    }else if (req.accepts('json')){
        res.json({"message":"404 NOT FOUND"})
    }else{
        res.type('txt').send("404 not found")
    }
})

app.use(errorHandler);


mongoose.connection.once('open', ()=>{
    console.log("connected to Mongoose DB")
    app.listen(PORT, ()=>{
        console.log(`Server running on ${PORT}`);
    })
})


mongoose.connection.on('error', (err)=>{
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscal}\t${err.hostname}`,'mongoErrLog.log')
})
