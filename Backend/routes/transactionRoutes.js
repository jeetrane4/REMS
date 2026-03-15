const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const transactionController = require("../controllers/transactionController");

/* =========================
CREATE TRANSACTION
========================= */

router.post(
"/",
protect,
authorize(["admin"]),
transactionController.createTransaction
);

/* =========================
GET TRANSACTIONS
========================= */

router.get(
"/",
protect,
authorize(["admin","buyer","seller"]),
transactionController.getTransactions
);

/* =========================
UPDATE TRANSACTION STATUS
========================= */

router.put(
"/:id",
protect,
authorize(["admin"]),
transactionController.updateTransactionStatus
);

module.exports = router;