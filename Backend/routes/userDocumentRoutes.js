const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const upload = require("../middleware/uploadMiddleware");

const controller = require("../controllers/userDocumentController");

/* =========================
   UPLOAD DOCUMENT
========================= */

router.post(
  "/",
  protect,
  upload.single("document"),
  [
    body("document_type")
      .notEmpty()
      .withMessage("Document type is required")
  ],
  validate,
  controller.uploadUserDocument
);

/* =========================
   GET USER DOCUMENTS
========================= */

router.get(
  "/",
  protect,
  controller.getUserDocuments
);

module.exports = router;