const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const otpController = require("../controllers/otpController");
const validate = require("../middleware/validate");
const protect = require("../middleware/authMiddleware");

/* =========================
   SEND OTP
========================= */

router.post(
  "/send",
  [
    body("mobile")
      .notEmpty()
      .withMessage("Mobile number is required")
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 and 15 digits")
  ],
  validate,
  otpController.sendOTP
);

/* =========================
   VERIFY OTP
========================= */

router.post(
  "/verify",
  [
    body("mobile")
      .notEmpty()
      .withMessage("Mobile number is required"),

    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 4, max: 6 })
      .withMessage("OTP must be 4-6 digits")
  ],
  validate,
  otpController.verifyOTP
);

module.exports = router;