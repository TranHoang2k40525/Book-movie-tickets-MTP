const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/movies/showing-today", movieController.getMoviesShowingToday);
router.get("/:id", movieController.getMovieById);
router.get("/:id/showtimes", movieController.getShowtimesByMovieId);
router.get("/:id/cinemas", movieController.getCinemasByMovieAndDate);
router.get(
  "/:movieId/cinemas/:cinemaId/showtimes",
  movieController.getShowtimesByCinemaAndDate
);
router.get(
  "/cinemas/:cinemaId/movies-and-showtimes",
  movieController.getMoviesAndShowtimesByCinema
);

// Protected routes - require authentication
router.use(authMiddleware);
router.get("/", movieController.getAllMovies);
router.post("/", movieController.addMovie);
router.put("/:id", movieController.updateMovie);
router.delete("/:id", movieController.deleteMovie);

module.exports = router;