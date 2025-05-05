// backend/routes/movies.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sql = require('mssql');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const movieController = require('../controllers/movieController');
router.get('/:showId/seats', movieController.getSeatMapByShow);



// Các route khác giữ nguyên
router.get('/',movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);
router.get('/:id/showtimes', movieController.getShowtimesByMovieId);
router.get('/:id/cinemas', movieController.getCinemasByMovieAndDate);
router.get('/:movieId/cinemas/:cinemaId/showtimes', movieController.getShowtimesByCinemaAndDate);
router.get('/movies/showing-today', movieController.getMoviesShowingToday);
router.get('/cinemas/:cinemaId/movies-and-showtimes', movieController.getMoviesAndShowtimesByCinema);
module.exports = router;