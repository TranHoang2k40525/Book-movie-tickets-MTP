const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Xử lý thanh toán đặt vé
router.post('/process', authMiddleware, paymentController.processPayment);

// Lấy danh sách voucher có thể áp dụng
router.get('/vouchers/:customerId/:amount?', authMiddleware, paymentController.getApplicableVouchers);

// Lấy thông tin chi tiết thanh toán
router.get('/details/:bookingId', authMiddleware, paymentController.getPaymentDetails);
// Xử lý thanh toán sau khi chọn sản phẩm
router.post('/process-payment', authMiddleware, paymentController.processPayment);


// Lấy thông tin thanh toán
router.get('/payment-details/:bookingId', authMiddleware, paymentController.getPaymentDetails);

router.post('/confirm/:bookingId', authMiddleware, paymentController.confirmPayment);
module.exports = router; 