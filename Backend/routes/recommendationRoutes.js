const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const recommendationController = require("../controllers/recommendationController");

router.get(
  "/",
  protect,
  recommendationController.getRecommendations
);

module.exports = router;