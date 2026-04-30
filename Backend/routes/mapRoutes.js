const express = require("express");
const { query } = require("express-validator");

const router = express.Router();

const validate = require("../middleware/validate");
const mapController = require("../controllers/mapController");

/* =========================
   MAP PROPERTY SEARCH
========================= */

router.get(
  "/",
  [
    query("lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Valid latitude required"),

    query("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Valid longitude required"),

    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage("Radius must be between 0.1 and 100 km"),

    query("type")
      .optional()
      .isIn(["house", "apartment", "villa", "commercial"])
      .withMessage("Invalid property type")
  ],
  validate,
  mapController.searchNearbyProperties
);

module.exports = router;