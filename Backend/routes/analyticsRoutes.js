const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const analyticsController = require("../controllers/analyticsController");

/* =========================
   ADMIN ANALYTICS
========================= */

router.get(
  "/",
  protect,
  authorize(["admin"]),
  analyticsController.getAnalytics
);

module.exports = router;