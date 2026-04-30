const express = require("express");
const { param, body } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const adminController = require("../controllers/adminController");

/* =========================
   GET ALL PROPERTIES
========================= */

router.get(
  "/properties",
  protect,
  authorize(["admin"]),
  adminController.getAllProperties
);

/* =========================
   VERIFY PROPERTY
========================= */

router.patch(
  "/properties/:id/verify",
  protect,
  authorize(["admin"]),
  [
    param("id").isInt().withMessage("Invalid property ID"),
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid verification status")
  ],
  validate,
  adminController.verifyProperty
);

router.get(
  "/user-documents",
  protect,
  authorize(["admin"]),
  adminController.getAllUserDocuments
);

router.patch(
  "/user-documents/:id/verify",
  protect,
  authorize(["admin"]),
  adminController.verifyUserDocument
);

router.get(
  "/property-documents",
  protect,
  authorize(["admin"]),
  adminController.getAllPropertyDocuments
);

router.patch(
  "/property-documents/:id/verify",
  protect,
  authorize(["admin"]),
  adminController.verifyPropertyDocument
);

module.exports = router;