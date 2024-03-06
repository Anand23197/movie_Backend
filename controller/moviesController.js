const Movie = require("../models/movieModel");
const ApiFeatures = require("../utils/ApiFeatures");
const CustomError = require("../utils/customError");
const asyncErrorHandler = require('../utils/asyncErrorHandler');

// exports.validateBody = (req, res)=>{
//      if(!req.body.name || !req.body.releaseYear){
//         return res.status(400).json({
//             status : "fail",
//             message : "not a valid movie data"
//         })
//      }
// }
exports.getHighestRated = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratings";
  next();
};
exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
//   try {
    const features = new ApiFeatures(Movie.find(), req.query)
      .sort()
      .limitFields()
      .paginate();

    let movies = await features.query;
    // console.log(req.query);
    // const excludeFields = ['sort', 'page', 'limit', 'fields'];

    // const queryObj = {...req.query};

    // excludeFields.forEach((el)=>{
    //    delete queryObj[el]
    // })

    // console.log(queryObj);

    // let query = Movie.find();
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   query = query.sort(sortBy);
    //   // movies.sort(req.query.sort);
    // } else {
    //   query = query.sort("-createdAt");
    // }

    //limiting fields
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");
    //   console.log(fields);
    //   query = query.select(fields);
    // } else {
    //   query = query.select("-__v");
    // }

    // pagination;
    // const page = +req.query.page || 1;
    // const limit = +req.query.limit || 10;
    // //PAGE 1:1 - 10; PAGE2:11 - 20; PAGE 3: 21 - 30
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const moviesCountPromise = Movie.countDocuments();
    //   const moviesCount = await moviesCountPromise;
    //   if (skip >= moviesCount) {
    //     throw Error("this page is not found");
    //   }
    // }
    // const movies = await query;
    // const queryObj = JSON.parse(queryStr);

    // const movies = await Movie.find().
    // where('duration').
    // equals(req.query.duration).
    // where('ratings')
    // .equals(req.query.ratings);

    res.status(200).json({
      status: "success",
      length: movies.length,
      data: {
        movies: movies,
      },
    });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {
//   try {
    const movie = await Movie.findById(req.params.id);
    console.log(x)
    if(!movie){
      const error = new CustomError("Movie with that id is not found!", 404)
      return next(error);
    }
    res.status(200).json({
      status: "success",
      length: movie.length,
      data: {
        movies: movie,
      },
    });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
});



exports.createMovie = asyncErrorHandler(async(req, res, next) => {
//   try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        movie,
      },
    });
//   } catch (err) {
    // res.status(400).json({
    //   status: "failed",
    //   message: err.message,
    // });
    // const error = new CustomError(err.message, 400)
    // next(error);
//   }
});

exports.updateMovie = async (req, res, next) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if(!updatedMovie){
      const error = new CustomError("Movie with that id is not found!", 404)
      return next(error);
    }
    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
  // try {
   const deleteMovie = await Movie.findByIdAndDelete(req.params.id);
   if(!deleteMovie){
    const error = new CustomError("Movie with that id is not found!", 404)
    return next(error);
   }
    res.status(204).json({
      status: "success",
      data: null,
    });
  // } catch (err) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: err.message,
  //   });
  // }
});

exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {
//   try {
    const stats = await Movie.aggregate([
      { $match: { ratings: { $gte: 4.5 } } },
      {
        $group: {
          _id: "$releaseYear",
          avgRating: { $avg: "$ratings" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          priceTotal: { $sum: "$price" },
          movieCount: { $sum: 1 },
        },
      },
      {
        $sort: { miniPrice: 1 },
      },
      { $match: { maxPrice: { $gte: 8 } } },
    ]);

    res.status(200).json({
      status: "success",
      count: stats.length,
      data: {
        stats,
      },
    });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
});

exports.getMovieByGenre = asyncErrorHandler(async (req, res, next) => {
//   try {
    const genre = req.params.genre;
    const movies = await Movie.aggregate([
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          movieCount: { $sum: 1 },
          movies: { $push: "$name" },
        },
      },
      { $addFields: { genre: "$_id" } },
      { $project: { _id: 0 } },
      { $sort: { movieCount: 1 } },
      // { $limit: 3 },
      { $match: { genres: genre } },
    ]);
    res.status(200).json({
      status: "success",
      count: movies.length,
      data: {
        movies,
      },
    });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
});
