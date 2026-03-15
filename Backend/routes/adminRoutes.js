const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const adminController = require("../controllers/adminController");

/* =========================
VERIFY PROPERTY
========================= */

router.put(
"/properties/:id/verify",
protect,
authorize(["admin"]),
adminController.verifyProperty
);

/* =========================
GET ALL PROPERTIES
========================= */

router.get(
"/properties",
protect,
authorize(["admin"]),
adminController.getAllProperties
);

module.exports = router;