const CustomError = require("../utils/customError")

const devErrors = (res,err)=>{
    res.status(err.statusCode).json({
        status : err.statusCode,
        message : err.message,
        stackTrace : err.stack,
        error : err
    })
}

const duplicateKeyErrorHandler = (err)=>{
    
     const name = err.keyValue.name;
     const msg = `There is already a movie with name ${name}. Please use another name!`;
    return new CustomError(msg,400);
}
const prodErrors = (res, err)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status : err.statusCode,
            message : err.message
        })
    }else{
        res.status(500).json({
            status : 'error',
            message : "something went wrong please try again later"
        })
    } 
}

const castErrorHandler = (err)=>{
    const msg = `Invalid value for ${err.value}: ${err.path}!`
    return new CustomError(msg, 400);
}

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    if(process.env.NODE_ENV === 'development'){
        devErrors(res, err);      
    }else if(process.env.NODE_ENV === 'production'){
        // let error = {...err};
        if(err.name === "CastError"){
            err = castErrorHandler(err)
        }
        if(err.code === 11000 ) err=> duplicateKeyErrorHandler(err)
        prodErrors(res, err);
    }
}