// backend/routes/products.js
const express = require('express');
const router = express.Router();
const getAllProducts = require('../controllers/productController'); // Import hàm trực tiếp
const authMiddleware = require('../middleware/authMiddleware');

router.get('/products', authMiddleware, getAllProducts); // Sử dụng hàm trực tiếp
module.exports = router;