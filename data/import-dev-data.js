const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const fs = require('fs');
const movie = require('./../models/movieModel');
const Movie = require('./../models/movieModel');

mongoose.connect(process.env.LOCAL_CONN_STR,{
    useNewUrlParser : true
}).then((conn)=>{
    console.log("DB connection successfull");
}).catch((err)=>{
    console.log("some error occured while connecting");
})

const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'))

//delete existing movies from collection
const deleteMovies = async ()=>{
        try{
           await Movie.deleteMany({});
            console.log("Data successfully deleted");
        }catch(err){
            console.log(err);
        }
        process.exit();
}


//insert movies data to mongodb collection
const importMovies = async ()=>{
    try{
        await Movie.create(movies);
        console.log("Data successfully import");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importMovies();
}
if(process.argv[2] === '--delete'){
    deleteMovies();
}