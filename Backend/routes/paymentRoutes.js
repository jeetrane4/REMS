const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const paymentController = require("../controllers/paymentController");

/* =========================
CREATE PAYMENT
========================= */

router.post(
  "/",
  protect,
  role(["admin"]),
  paymentController.createPayment
);

/* =========================
GET PAYMENTS
========================= */

router.get(
  "/",
  protect,
  role(["admin"]),
  paymentController.getPayments
);

module.exports = router;