const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const transactionController = require("../controllers/transactionController");

// Create transaction (admin only)
router.post(
  "/",
  protect,
  role(["admin"]),
  transactionController.createTransaction
);

// Get all transactions (admin only)
router.get(
  "/",
  protect,
  transactionController.getTransactions
);

// Update transaction status (admin only)
router.put(
  "/:id",
  protect,
  role(["admin"]),
  transactionController.updateTransactionStatus
);

module.exports = router;