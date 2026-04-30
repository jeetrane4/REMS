const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const controller = require("../controllers/reviewController");

router.post(
  "/",
  protect,
  [
    body("property_id").isInt().withMessage("Valid property ID is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isString().withMessage("Comment must be text")
  ],
  validate,
  controller.addReview
);

router.get(
  "/:property_id",
  [
    param("property_id").isInt().withMessage("Invalid property ID")
  ],
  validate,
  controller.getPropertyReviews
);

module.exports = router;