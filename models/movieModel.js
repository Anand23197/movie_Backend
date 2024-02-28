const { default: mongoose } = require("mongoose");

const movieSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required field!"],
    unique: true,
    trim: true,
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
  },
  directors: {
    type: [String],
    required: [true, "Directors is required rield!"],
  },

  coverImage: {
    type: String,
    required: [true, "cover image is required field"],
  },
  actors : {
    type : [String],
    required : [true, "actors is required field"],
  },
  price : {
    type : Number,
    required : [true, "price is required field"],
  }
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
