const Movie = require("../models/movieModel");
const ApiFeatures = require("../utils/ApiFeatures");

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
exports.getAllMovies = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: "success",
      length: movie.length,
      data: {
        movies: movie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
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

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
