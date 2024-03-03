const express = require("express");
const moviesController = require("../controller/moviesController");

const router = express.Router();

// router.param('id', moviesController.checkId);

router.route("/movie-stats").get(moviesController.getMovieStats);
router.route("/movies-by-genre/:genere").get(moviesController.getMovieByGenre);

router
  .route("/highest-rated")
  .get(moviesController.getHighestRated, moviesController.getAllMovies);

router
  .route("/")
  .get(moviesController.getAllMovies)
  .post(moviesController.createMovie);
router
  .route("/:id")
  .get(moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(moviesController.deleteMovie);

module.exports = router;
