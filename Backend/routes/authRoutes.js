const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

/* =========================
   REGISTER
========================= */

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("mobile")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 and 15 digits"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain one number"),

    body("role")
      .optional()
      .isIn(["buyer", "seller", "agent"])
      .withMessage("Role must be buyer, seller, or agent")
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
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ],
  validate,
  authController.login
);

/* =========================
   GET CURRENT USER
========================= */

router.get("/me", protect, authController.getCurrentUser);

/* =========================
   LOGOUT
========================= */

router.post("/logout", protect, authController.logout);

module.exports = router;