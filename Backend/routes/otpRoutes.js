const express = require("express");
const router = express.Router();

const otpController = require("../controllers/otpController");

/* =========================
SEND OTP
========================= */

router.post("/send", otpController.sendOTP);

/* =========================
VERIFY OTP
========================= */

router.post("/verify", otpController.verifyOTP);

module.exports = router;