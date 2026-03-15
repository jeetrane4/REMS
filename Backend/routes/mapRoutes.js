const express = require("express");
const router = express.Router();

const mapController = require("../controllers/mapController");

/* =========================
MAP PROPERTY SEARCH
========================= */

router.get("/", mapController.searchNearbyProperties);

module.exports = router;