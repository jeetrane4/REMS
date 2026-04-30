const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const loanController = require("../controllers/loanController");

router.post(
  "/apply",
  protect,
  authorize(["buyer"]),
  [
    body("property_id").isInt().withMessage("Valid property ID is required"),
    body("loan_amount").isNumeric().withMessage("Valid loan amount is required"),
    body("annual_income").optional().isNumeric().withMessage("Annual income must be numeric"),
    body("employment_type").optional().isString().withMessage("Employment type must be text")
  ],
  validate,
  loanController.applyLoan
);

router.get(
  "/",
  protect,
  authorize(["buyer"]),
  loanController.getUserLoans
);

router.get(
  "/admin",
  protect,
  authorize(["admin"]),
  loanController.getAllLoans
);

router.patch(
  "/:loan_id/status",
  protect,
  authorize(["admin"]),
  [
    param("loan_id").isInt().withMessage("Invalid loan ID"),
    body("loan_status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid loan status")
  ],
  validate,
  loanController.updateLoanStatus
);

module.exports = router;