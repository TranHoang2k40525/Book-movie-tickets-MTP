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

// Làm mới token
router.post('/refresh-token', authController.refreshToken);

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 259430187e2398ff2d9c39e096d87a1c6ce7111b
