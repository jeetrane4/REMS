const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const paymentController = require("../controllers/paymentController");

/* =========================
   CREATE PAYMENT
========================= */

router.post(
  "/",
  protect,
  authorize(["admin", "buyer"]),
  [
    body("transaction_id")
      .isInt()
      .withMessage("Valid transaction ID is required"),

    body("amount_paid")
      .isNumeric()
      .withMessage("Valid amount is required"),

    body("method")
      .isIn(["upi", "card", "netbanking", "cash"])
      .withMessage("Payment method must be upi, card, netbanking, or cash"),

    body("gateway")
      .optional()
      .isString()
      .withMessage("Gateway must be text"),

    body("gateway_transaction_id")
      .optional()
      .isString()
      .withMessage("Gateway transaction ID must be text")
  ],
  validate,
  paymentController.createPayment
);

/* =========================
   GET PAYMENTS
========================= */

router.get(
  "/",
  protect,
  authorize(["admin", "buyer", "seller", "agent"]),
  paymentController.getPayments
);

module.exports = router;