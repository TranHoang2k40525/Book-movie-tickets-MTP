const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Lấy danh sách thành phố
router.get('/cities', locationController.getCities);

// Lấy danh sách rạp chiếu phim
router.get('/cinemas', locationController.getCinemas);

// Lấy thông tin rạp theo khu vực (thành phố)
router.get('/cinemas-by-city/:cityId', locationController.getCinemasByCity);

module.exports = router;