const { default: mongoose } = require("mongoose");
const fs = require("fs");
const movieSchema = mongoose.Schema(
  {
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
const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
