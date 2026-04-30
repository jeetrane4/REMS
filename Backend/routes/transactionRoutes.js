const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const transactionController = require("../controllers/transactionController");

/* =========================
   CREATE TRANSACTION
========================= */

router.post(
  "/",
  protect,
  authorize(["admin", "seller", "agent"]),
  [
    body("property_id").isInt().withMessage("Valid property ID is required"),
    body("buyer_id").isInt().withMessage("Valid buyer ID is required"),
    body("seller_id").isInt().withMessage("Valid seller ID is required"),
    body("amount").isNumeric().withMessage("Valid amount is required")
  ],
  validate,
  transactionController.createTransaction
);

/* =========================
   GET TRANSACTIONS
========================= */

router.get(
  "/",
  protect,
  authorize(["admin", "buyer", "seller", "agent"]),
  transactionController.getTransactions
);

/* =========================
   UPDATE TRANSACTION STATUS
========================= */

router.patch(
  "/:id/status",
  protect,
  authorize(["admin"]),
  [
    param("id").isInt().withMessage("Invalid transaction ID"),
    body("payment_status")
      .isIn(["pending", "completed", "cancelled"])
      .withMessage("Invalid payment status")
  ],
  validate,
  transactionController.updateTransactionStatus
);

module.exports = router;