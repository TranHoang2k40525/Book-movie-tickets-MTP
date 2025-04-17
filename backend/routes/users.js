const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require("../middleware/authMiddleware");



// Lấy thông tin tài khoản
router.post('/get-account', authMiddleware, userController.getAccount);

// Lấy thông tin khách hàng
router.post('/get-customer', authMiddleware, userController.getCustomer);

// Cập nhật avatar
router.post('/update-avatar', authMiddleware, userController.updateAvatar);

// Cập nhật thông tin khách hàng
router.put('/update-customer', authMiddleware, userController.updateCustomer);

// Xóa tài khoản
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;