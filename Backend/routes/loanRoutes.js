const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const loanController = require("../controllers/loanController");

/* =========================
APPLY LOAN
========================= */

router.post(
"/apply",
protect,
role(["buyer"]),
loanController.applyLoan
);

/* =========================
GET USER LOANS
========================= */

router.get(
"/",
protect,
loanController.getUserLoans
);

/* =========================
ADMIN: ALL LOANS
========================= */

router.get(
"/admin",
protect,
role(["admin"]),
loanController.getAllLoans
);

/* =========================
ADMIN UPDATE LOAN
========================= */

router.put(
"/:loan_id",
protect,
role(["admin"]),
loanController.updateLoanStatus
);

module.exports = router;