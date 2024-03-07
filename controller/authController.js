const User = require('./../models/userModel')
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken')
const CustomError = require('../utils/customError')

exports.signup = asyncErrorHandler(async(req, res, next)=>{
   const newUser = await User.create(req.body);

   const token = jwt.sign({id : newUser._id}, process.env.SECRET_STR, {
      expiresIn : process.env.LOGIN_EXPIRES
   });

   res.status(201).json({
        status : "success",
          token,
        data  :{
            user : newUser
        } 
   })
})

exports.login = asyncErrorHandler(async(req, res, next)=>{
      // const email = req.body.email;
      // const password = req.body.password;

      const {email, password } = req.body;
      if(!email || !password){
            const error = new CustomError("Please provide email and password for login in.")
            return next(error);
      }

      //check if the user exist in database
      const user = await User.findOne({email : email})
      if(!user){
         const error = new CustomError("User does not exist.")
         return next(error);
      }
      res.status(200).json({
         status : "success",
         user,
         token : ""
      })
})