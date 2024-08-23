const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("connected....")
    }catch(err){
        console.log(err.message);
    }
}

module.exports  = connectDB;