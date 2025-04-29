const express = require("express");
const router = express.Router();
const { holdSeats,cancelBooking } = require("../controllers/datgheController"); // Sửa thành datgheController
const authMiddleware = require("../middleware/authMiddleware");

router.post("/hold-seats", authMiddleware, holdSeats);
router.post("/cancel-booking", authMiddleware, cancelBooking);
module.exports = router;