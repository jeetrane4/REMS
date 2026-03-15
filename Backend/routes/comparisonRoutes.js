const express = require("express");
const router = express.Router();

const comparisonController = require("../controllers/comparisonController");

/* =========================
COMPARE PROPERTIES
========================= */

router.post("/", comparisonController.compareProperties);

module.exports = router;