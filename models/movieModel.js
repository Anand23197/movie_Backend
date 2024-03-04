const { default: mongoose } = require("mongoose");
const fs = require("fs");
var validator = require('validator');


const movieSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required field!"],
      maxlength: [100, "movie name must note have more than 100 characters"],
      minlength: [4, "movie name must note have less than 4 characters"],
      unique: true,
      trim: true,
      // validate : [validator.isAlpha, "Name should only contains alphabet"]
    },
    description: {
      type: String,
      required: [true, "name is required field!"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "duration is required field"],
    },
    ratings: {
      type: Number,
      // min: [1, "ratings must be 1 or greater than 1"],
      // max: [10, "ratings must be 10 or less"],
      validate :{
        validator : function(value){
          return (value >= 1) && (value <= 10)
         },
         message : "Ratings {{VALUE}} should be above 1 and below 10"
      } 
    },
    totalRating: {
      type: Number,
    },
    releaseYear: {
      type: Number,
      required: [true, "release Year is required Field!"],
    },
    ReleaseDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      Default: Date.now(),
    },
    genres: {
      type: [String],
      required: [true, "Generes is required rield!"],
      // enum: {
      //   values: [
      //     "Action",
      //     "Adventure",
      //     "Sci-fi",
      //     "Thriller",
      //     "Crime",
      //     "Drama",
      //     "Comedy",
      //     "Romance",
      //     "Biography",
      //   ],
      //   message: "This genres does not exist",
      // },
    },
    directors: {
      type: [String],
      required: [true, "Directors is required rield!"],
    },

    coverImage: {
      type: String,
      required: [true, "cover image is required field"],
    },
    actors: {
      type: [String],
      required: [true, "actors is required field"],
    },
    price: {
      type: Number,
      required: [true, "price is required field"],
    },
    createdBy: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

//middleware in mongodb
//executed before the document is saved in db
//.save() or .create()
//insertMany or findByIdAndUpdate will not work

movieSchema.pre("save", function (next) {
  this.createdBy = "anand";
  next();
});

movieSchema.post("save", function (doc, next) {
  this.find({ ReleaseDate: { $lte: Date.now() } });
  this.endTime = Date.now();
  const content = `Query took ${
    this.endTime - this.startTime
  } millisecond to fetch the document`;
  fs.writeFileSync("log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

movieSchema.pre(/^find/, function (next) {
  this.find({ ReleaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (docs, next) {
  this.find({ ReleaseDate: { $lte: Date.now() } });
  this.endTime = Date.now();
  next();
});

movieSchema.pre("aggregate", function (next) {
  console.log(
    this._pipeline.unshift({ $match: { releaseYear: { $lte: Date.now() } } })
  );
  next();
});
const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
