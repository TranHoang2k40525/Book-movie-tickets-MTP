const express = require("express");
const router = express.Router();
const { likeMovie, getLikeStatus } = require("../controllers/likeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/like", authMiddleware, likeMovie);
router.get("/like/:movieId", authMiddleware, getLikeStatus);

module.exports = router;