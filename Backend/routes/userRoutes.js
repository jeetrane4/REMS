const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const userController = require("../controllers/userController");

// GET ALL USERS (Admin only)
router.get(
  "/",
  protect,
  role(["admin"]),
  userController.getUsers
);

module.exports = router;