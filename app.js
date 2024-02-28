const express = require('express');
const morgan = require('morgan');
let app = express();
const moviesRouter = require('./Routes/moviesRoutes');

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

module.exports = app;