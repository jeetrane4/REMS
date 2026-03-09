const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const paymentController = require("../controllers/paymentController");

// Create payment (admin only)
router.post(
  "/",
  protect,
  role(["admin"]),
  paymentController.createPayment
);

// Get all payments (admin only)
router.get(
  "/",
  protect,
  role(["admin"]),
  paymentController.getPayments
);

module.exports = router;