const express = require("express");
const router = express.Router();
const { holdSeats, cancelBooking, getSeatMapByShow } = require("../controllers/datgheController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/hold-seats", authMiddleware, holdSeats);
router.post("/cancel-booking", authMiddleware, cancelBooking);
router.get("/datghe/:showId/seats", authMiddleware, getSeatMapByShow);

module.exports = router;