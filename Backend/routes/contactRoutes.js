const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const validate = require("../middleware/validate");
const contactController = require("../controllers/contactController");

/* =========================
   SEND CONTACT MESSAGE
========================= */

router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 5 })
      .withMessage("Message must be at least 5 characters")
  ],
  validate,
  contactController.sendMessage
);

module.exports = router;