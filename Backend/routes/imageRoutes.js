const express = require("express");
const { param } = require("express-validator");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");

const controller = require("../controllers/imageUploadController");

const router = express.Router();

/* =========================
   UPLOAD PROPERTY IMAGES
========================= */

router.post(
  "/:property_id",
  protect,
  authorize(["seller", "agent", "admin"]),
  [
    param("property_id")
      .isInt()
      .withMessage("Invalid property ID")
  ],
  validate,
  upload.array("images", 10),
  controller.uploadPropertyImages
);

module.exports = router;