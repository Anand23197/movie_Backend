const Movie = require('../models/movieModel')


// exports.validateBody = (req, res)=>{
//      if(!req.body.name || !req.body.releaseYear){
//         return res.status(400).json({
//             status : "fail",
//             message : "not a valid movie data"
//         })
//      }
// }

exports.getAllMovies = async(req, res) => {
    try{
        // console.log(req.query);
        // const excludeFields = ['sort', 'page', 'limit', 'fields'];

        // const queryObj = {...req.query};

        // excludeFields.forEach((el)=>{
        //    delete queryObj[el]
        // })

        // console.log(queryObj);
        
        const movies = await Movie.find(req.query);
        // const movies = await Movie.find().
        // where('duration').
        // equals(req.query.duration).
        // where('ratings')
        // .equals(req.query.ratings);
        
        res.status(200).json({
            status : "success",
            length : movies.length,
            data : {
                movies : movies
            }
        })
    }catch(err){
        res.status(400).json({
            status : "fail",
            message: err.message    
        })
    }
};

exports.getMovie = async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id)
        res.status(200).json({
            status : "success",
            length : movie.length,
            data : {
                movies : movie
            }
        })
    }catch(err){
        res.status(400).json({
            status : "fail",
            message : err.message
        })
    }

};

exports.createMovie = async(req, res) => {

   try{
       const movie = await Movie.create(req.body)
       res.status(201).json({
        status : "success",
        data : {
            movie 
        }
       })
   }catch(err){
       res.status(400).json({
        status : "failed",
        message : err.message
       })
   }


};

exports.updateMovie = async (req, res) => {
        try{
          const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators : true});
          res.status(200).json({
            status : "success",
            data : {
                movie : updatedMovie
            }
          })
        }catch(err){
            res.status(404).json({
                status : "fail",
                message: err.message
            })
        }
};

exports.deleteMovie = async(req, res) => {
            try{
              await Movie.findByIdAndDelete(req.params.id);
              res.status(204).json({
                status : "success",
                data : null
              })
            }catch(err){
                res.status(404).json({
                    status : "fail",
                    message: err.message
                })
            }
};