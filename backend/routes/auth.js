const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng nhập
router.post('/login', authController.login);

// Đăng ký
router.post('/register', authController.register);

// Gửi OTP
router.post('/send-otp', authController.sendOtp);

// Đặt lại mật khẩu
router.post('/reset-password', authController.resetPassword);

module.exports = router;