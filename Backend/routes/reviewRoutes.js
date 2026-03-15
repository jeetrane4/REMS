const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const controller = require("../controllers/reviewController");

/* =========================
ADD REVIEW
========================= */

router.post("/", protect, controller.addReview);

/* =========================
GET REVIEWS
========================= */

router.get("/:property_id", controller.getPropertyReviews);

module.exports = router;