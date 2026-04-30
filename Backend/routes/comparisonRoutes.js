const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const validate = require("../middleware/validate");
const comparisonController = require("../controllers/comparisonController");

/* =========================
   COMPARE PROPERTIES
========================= */

router.post(
  "/",
  [
    body("property_ids")
      .isArray({ min: 2, max: 5 })
      .withMessage("Provide 2 to 5 property IDs for comparison"),

    body("property_ids.*")
      .isInt()
      .withMessage("Each property ID must be a number")
  ],
  validate,
  comparisonController.compareProperties
);

module.exports = router;