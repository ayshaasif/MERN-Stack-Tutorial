const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


/**
 !!! Lean() returns a JavaScript object instead of a Mongoose document.
 Documents are much heavier than vanilla JavaScript objects, because they have a lot of internal state for change tracking.
 */
const getAllUsers = asyncHandler(async(req,res)=>
{
    const users = await User.find().select("-password").lean()

    if(!users?.length){
        return res.status(400).json({"message":"No users Found"});
    }
    res.status(200).json(users);
})




const createNewUser = asyncHandler(async(req,res)=>{
    const {username,password, roles } = req.body;
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({"message":"All fields are required"});
    }

    //check for duplicates
    const duplicates = await User.findOne({username}).lean().exec()  
    if(duplicates) return res.status(409).json({"message":"username already taken"}); 
    const hashPwd = await bcrypt.hash(password, 10);

    const user = await User.create({
            username,
            "password":hashPwd,
            roles
    })

    if(user){
       res.status(201).json({"message":`New User ${username} created`});
    }else{
        res.status(400).json({"message":"Invalid User Data Received"})
    }

})




const updateUser = asyncHandler(async(req,res)=>{
    const {id, username, roles, active,password} = req.body;

    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active != 'boolean'){
        return res.status(400).json({'message':"All fields are required"})

    }
    const user = await User.findById(id).exec();
    if (!user){
        return res.status(400).json({"message":"User not found"});
    }
    const duplicate = await User.findOne({username}).lean().exec();
    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(400).json({"message":"User already exists"});
    }
    
     
    user.username = username;
    user.roles = roles
    user.active = active
    let message = ''

    if (password) {
        user.password = await bcrypt.hash(password, 10);
        message = `user ${user.username}'s password updated\n`
    }

    const updatedUser =  await user.save();
    message =`${message} ${updatedUser.username} updated`
    res.json({"message":message})
    
})


const deleteUser = asyncHandler(async(req,res)=>{
    const {id} = req.body;
    if (!id){
        return res.status(400).json({"message":"User Id required"});
    }
    const note = await Note.findOne({user:id}).lean().exec();
    if (note){
        return res.status(400).json({"message":"User has notes"})
    }
    const user = await User.findById(id).exec();

    if (!user){
        return res.status(400).json({"message":`User ${user.username} not found`})
    }

    const result = await user.deleteOne()
    console.log(result)
    const reply  = `Username ${result.username} with ID ${result._id} deleted`;

    res.status(200).json(reply)

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}