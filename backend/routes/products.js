// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../controllers/productController');

// Bỏ middleware xác thực vì đây là data public
router.get('/products', getAllProducts);

module.exports = router;