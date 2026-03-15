const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const dashboardController = require("../controllers/dashboardController");

router.get("/", protect, dashboardController.getDashboardStats);

router.get("/stats", dashboardController.getHomepageStats);

router.get("/activity", protect, dashboardController.getRecentActivity);

module.exports = router;