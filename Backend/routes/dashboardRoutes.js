const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

/* =========================
Dashboard Summary
========================= */

router.get(
  "/",
  protect,
  dashboardController.getDashboardStats
);

/* =========================
Homepage Stats (Landing Page)
========================= */

router.get(
  "/stats",
  protect,
  dashboardController.getHomepageStats
);

/* =========================
Recent Activity
========================= */

router.get(
  "/activity",
  protect,
  dashboardController.getRecentActivity
);

module.exports = router;