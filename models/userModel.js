const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name : {
        type  : String,
        required : [true, "Please enter your name"],

    },
    email  :{
        type : String,
        required: [true, "please enter an email"],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail, "Please enter a valid email."]
    },
    photo : String,
    password:{
        type : String, 
        required : [true, "Please enter a password"],
        minlength : 8,
        select  :false
    },
    confirmPassword : {
        type : String,
        required : [true, "Please confirm your password"],
        validate: {
            //this validtor will only work for save & create
            validator:function(val){
               return val === this.password
            },
            message : "Password & Confirm password does not match"
        }
    },
    passwordChangedAt : Date
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
       return next();
    }

    // encrypt the password before saving this
   this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined
    next()
})

userSchema.methods.comparePasswordInDb = async function(pswd, pswdDb){
    return await bcrypt.compare(pswd, pswdDb)
}

userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
    if(this.passwordChangedAt){
       const passwordChangedAt = parseInt(this.passwordChangedAt.getTime()/1000);
        console.log(passwordChangedAt, JWTTimestamp);
        //password was changes after jwt issued
       return JWTTimestamp < passwordChangedAt
    }
    return false;
}
const User = mongoose.model("User", userSchema)
module.exports = User