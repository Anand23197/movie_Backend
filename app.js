const express = require('express');
const morgan = require('morgan');
let app = express();
const moviesRouter = require('./Routes/moviesRoutes');
const CustomError = require('./utils/customError');
const globalErrHandler = require('./controller/errorController')

const logger = function(req, res, next){
      console.log("custom middleware called");
      next()
}

app.use(express.json());

if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}

app.use(express.static('./public'));
app.use(logger);
app.use((req, res, next)=>{
    req.requestedAt = new Date().toISOString();
    next();
})
app.use('/api/v1/movies' , moviesRouter)

app.all('*',(req, res, next)=>{
    // res.status(404).json({
    //     status : "fail",
    //     message : `can't find ${req.originalUrl} on the server`
    // })
    // const err = new Error(`can't find ${req.originalUrl} on the server`);
    // err.status = "fail"
    // err.statusCode = 400
    const err = new CustomError(`can't find ${req.originalUrl} on the server`, 404)
    next(err);
})

//Global error handling middlware function
app.use(globalErrHandler)

module.exports = app;