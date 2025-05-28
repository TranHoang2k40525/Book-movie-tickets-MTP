const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");
const authMiddleware = require("../middleware/authMiddleware");

// Kiểm tra quyền admin cho tất cả các route thống kê
router.use(authMiddleware);

router.get("/dashboard", statisticsController.getDashboardStats);
router.get("/revenue", statisticsController.getRevenueStats);
router.get("/tickets", statisticsController.getTicketStats);

module.exports = router;