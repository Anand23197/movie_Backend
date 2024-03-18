const express = require("express");
const morgan = require("morgan");
let app = express();
const moviesRouter = require("./Routes/moviesRoutes");
const authRouter = require("./Routes/authRoutes");
const userRouter = require("./Routes/userRoutes");
const CustomError = require("./utils/customError");
const globalErrHandler = require("./controller/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");

app.use(helmet());
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message:
    "we have received to many request from this ip. please try after 1 hour",
  // store: ... , // Redis, Memcached, etc. See below.
});

// Apply the rate limiting middleware to all requests.
app.use("/api", limiter);
const logger = function (req, res, next) {
  console.log("custom middleware called");
  next();
};

app.use(express.json({ limit: "10kb" }));
app.use(sanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratings",
      "releaseYear",
      "ReleaseDate",
      "genres",
      "directors",
      "actors",
      "price",
    ],
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static("./public"));
app.use(logger);
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //     status : "fail",
  //     message : `can't find ${req.originalUrl} on the server`
  // })
  // const err = new Error(`can't find ${req.originalUrl} on the server`);
  // err.status = "fail"
  // err.statusCode = 400
  const err = new CustomError(
    `can't find ${req.originalUrl} on the server`,
    404
  );
  next(err);
});

//Global error handling middlware function
app.use(globalErrHandler);

module.exports = app;
