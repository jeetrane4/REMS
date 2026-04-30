const express = require("express");
const { param, body } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const upload = require("../middleware/uploadMiddleware");

const controller = require("../controllers/propertyDocumentController");

/* =========================
   UPLOAD PROPERTY DOCUMENT
========================= */

router.post(
  "/:property_id",
  protect,
  authorize(["seller", "agent", "admin"]),
  upload.single("document"),
  [
    param("property_id")
      .isInt()
      .withMessage("Invalid property ID"),

    body("document_type")
      .notEmpty()
      .withMessage("Document type is required")
  ],
  validate,
  controller.uploadPropertyDocument
);

/* =========================
   GET PROPERTY DOCUMENTS
========================= */

router.get(
  "/:property_id",
  protect,
  authorize(["seller", "agent", "admin"]),
  [
    param("property_id")
      .isInt()
      .withMessage("Invalid property ID")
  ],
  validate,
  controller.getPropertyDocuments
);

module.exports = router;