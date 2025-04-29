const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require("../middleware/authMiddleware");

// Lấy tất cả voucher còn hoạt động và chưa được sử dụng
router.get('/vouchers', authMiddleware, voucherController.getVouchers);

// Sử dụng một voucher
router.post('/use-voucher', authMiddleware, voucherController.useVoucher);

module.exports = router;