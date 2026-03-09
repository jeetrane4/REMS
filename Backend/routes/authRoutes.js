const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("mobile").isMobilePhone().withMessage("Valid mobile number required"),
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
      .withMessage("Select valid role")
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  authController.login
);

module.exports = router;