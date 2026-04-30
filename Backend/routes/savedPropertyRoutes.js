const express = require("express");
const { param, body } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const controller = require("../controllers/savedPropertyController");

/* =========================
   SAVE PROPERTY
========================= */

router.post(
  "/",
  protect,
  authorize(["buyer"]),
  [
    body("property_id")
      .isInt()
      .withMessage("Valid property ID is required")
  ],
  validate,
  controller.saveProperty
);

/* =========================
   GET SAVED PROPERTIES
========================= */

router.get(
  "/",
  protect,
  authorize(["buyer"]),
  controller.getSavedProperties
);

/* =========================
   REMOVE SAVED PROPERTY
========================= */

router.delete(
  "/:property_id",
  protect,
  authorize(["buyer"]),
  [
    param("property_id")
      .isInt()
      .withMessage("Invalid property ID")
  ],
  validate,
  controller.removeSavedProperty
);

module.exports = router;