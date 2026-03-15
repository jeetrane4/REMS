const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const analyticsController = require("../controllers/analyticsController");

/* =========================
ADMIN ANALYTICS
========================= */

router.get(
"/",
protect,
role(["admin"]),
analyticsController.getAnalytics
);

module.exports = router;