const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const dashboardController = require("../controllers/dashboardController");

/* =========================
   USER DASHBOARD
========================= */

router.get(
  "/",
  protect,
  authorize(["buyer", "seller", "agent", "admin"]),
  dashboardController.getDashboardStats
);

/* =========================
   HOMEPAGE STATS (PUBLIC)
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
  authorize(["buyer", "seller", "agent", "admin"]),
  dashboardController.getRecentActivity
);

module.exports = router;