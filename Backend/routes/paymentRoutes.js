const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const paymentController = require("../controllers/paymentController");

/* =========================
CREATE PAYMENT
========================= */

router.post(
"/",
protect,
authorize(["admin"]),
paymentController.createPayment
);

/* =========================
GET PAYMENTS
========================= */

router.get(
"/",
protect,
authorize(["admin"]),
paymentController.getPayments
);

module.exports = router;