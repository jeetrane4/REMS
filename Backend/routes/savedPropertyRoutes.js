const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const controller = require("../controllers/savedPropertyController");

// save property
router.post("/", protect, controller.saveProperty);

// get saved properties
router.get("/", protect, controller.getSavedProperties);

// remove saved property
router.delete("/:property_id", protect, controller.removeSavedProperty);

module.exports = router;