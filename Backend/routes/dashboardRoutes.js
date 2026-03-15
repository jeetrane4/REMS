const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const dashboardController = require("../controllers/dashboardController");

/* =========================
DASHBOARD STATS
========================= */

router.get(
  "/",
  protect,
  dashboardController.getDashboardStats
);

/* =========================
HOMEPAGE STATS
========================= */

router.get(
  "/stats",
  dashboardController.getHomepageStats
);

/* =========================
RECENT ACTIVITY
========================= */

router.get(
  "/activity",
  protect,
  dashboardController.getRecentActivity
);

module.exports = router;