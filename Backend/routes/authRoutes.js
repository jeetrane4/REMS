const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const { body } = require("express-validator");
const validate = require("../middleware/validate");

/* =========================
REGISTER
========================= */

router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .withMessage("Valid email required"),

    body("mobile")
      .optional()
      .isMobilePhone()
      .withMessage("Valid mobile number required"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain one number"),

    body("role")
      .optional()
      .isIn(["buyer", "seller", "agent"])
      .withMessage("Invalid role")
  ],
  validate,
  authController.register
);

/* =========================
LOGIN
========================= */

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email required"),

    body("password")
      .notEmpty()
      .withMessage("Password required")
  ],
  validate,
  authController.login
);

/* =========================
GET CURRENT USER
========================= */

router.get("/me", protect, authController.getCurrentUser);

module.exports = router;