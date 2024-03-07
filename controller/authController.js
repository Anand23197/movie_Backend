const User = require('./../models/userModel')
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken')

exports.signup = asyncErrorHandler(async(req, res, next)=>{
   const newUser = await User.create(req.body);

//    const token = 

   res.status(201).json({
        status : "success",
        data  :{
            user : newUser
        } 
   })
})