const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const controller = require("../controllers/savedPropertyController");
const role = require("../middleware/roleMiddleware");

router.post("/", protect, role(["buyer"]), controller.saveProperty);
router.get("/", protect, controller.getSavedProperties);
router.delete("/:property_id", protect, controller.removeSavedProperty);

module.exports = router;