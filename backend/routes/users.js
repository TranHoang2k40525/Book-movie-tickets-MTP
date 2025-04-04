const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Lấy thông tin tài khoản
router.post('/get-account', userController.getAccount);

// Lấy thông tin khách hàng
router.post('/get-customer', userController.getCustomer);

// Cập nhật avatar
router.post('/update-avatar', userController.updateAvatar);

// Cập nhật thông tin khách hàng
router.put('/update-customer', userController.updateCustomer);

// Xóa tài khoản
router.delete('/delete-account', userController.deleteAccount);

module.exports = router;