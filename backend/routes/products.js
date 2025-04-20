// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { getAllProducts } = require('../controllers/productController'); // Import hàm từ object

// Bỏ middleware xác thực để dễ test
// Đảm bảo mọi thiết bị có thể truy cập API này mà không cần xác thực
router.get('/products', getAllProducts);

module.exports = router;