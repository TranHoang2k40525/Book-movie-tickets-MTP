const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Lấy danh sách phim
router.get('/', movieController.getAllMovies);

// Lấy thông tin chi tiết phim
router.get('/:id', movieController.getMovieById);

module.exports = router;