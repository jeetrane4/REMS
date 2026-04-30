const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const controller = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

/* =========================
   PUBLIC PROPERTY ROUTES
========================= */

router.get("/", controller.getProperties);

router.get(
  "/mine",
  protect,
  authorize(["seller", "agent", "admin"]),
  controller.getMyProperties
);

router.get(
  "/:id",
  [
    param("id")
      .isInt()
      .withMessage("Invalid property ID")
  ],
  validate,
  controller.getPropertyById
);

/* =========================
   CREATE PROPERTY
========================= */

router.post(
  "/",
  protect,
  authorize(["seller", "agent", "admin"]),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("price").isNumeric().withMessage("Valid price required"),
    body("type").notEmpty().withMessage("Property type required"),
    body("city").notEmpty().withMessage("City required")
  ],
  validate,
  controller.createProperty
);

/* =========================
   UPDATE PROPERTY
========================= */

router.patch(
  "/:id",
  protect,
  authorize(["seller", "agent", "admin"]),
  [
    param("id").isInt().withMessage("Invalid property ID")
  ],
  validate,
  controller.updateProperty
);

/* =========================
   DELETE PROPERTY
========================= */

router.delete(
  "/:id",
  protect,
  authorize(["seller", "agent", "admin"]),
  [
    param("id").isInt().withMessage("Invalid property ID")
  ],
  validate,
  controller.deleteProperty
);

/* =========================
   ADMIN VERIFY PROPERTY
========================= */

router.patch(
  "/:id/verify",
  protect,
  authorize(["admin"]),
  [
    param("id").isInt().withMessage("Invalid property ID"),
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid verification status")
  ],
  validate,
  controller.verifyProperty
);

module.exports = router;