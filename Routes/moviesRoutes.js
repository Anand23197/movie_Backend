const express = require("express");
const moviesController = require("../controller/moviesController");
const authController = require("../controller/authController");
const router = express.Router();

// router.param('id', moviesController.checkId);

router
  .route("/movie-stats")
  .get(authController.protect, moviesController.getMovieStats);
router.route("/movies-by-genre/:genere").get(moviesController.getMovieByGenre);

router
  .route("/highest-rated")
  .get(moviesController.getHighestRated, moviesController.getAllMovies);

router
  .route("/")
  .get(authController.protect, moviesController.getAllMovies)
  .post(moviesController.createMovie);
router
  .route("/:id")
  .get(authController.protect, moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    moviesController.deleteMovie
  );

module.exports = router;
