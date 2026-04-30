const express = require("express");
const { param, body } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const userController = require("../controllers/userController");

/* =========================
   GET PROFILE (SELF)
========================= */

router.get(
  "/profile/me",
  protect,
  userController.getProfile
);

/* =========================
   UPDATE PROFILE (SELF)
========================= */

router.patch(
  "/profile/me",
  protect,
  [
    body("name").optional().isLength({ min: 2 }).withMessage("Name too short"),
    body("mobile").optional().isLength({ min: 10 }).withMessage("Invalid mobile")
  ],
  validate,
  userController.updateProfile
);

/* =========================
   GET ALL USERS (ADMIN)
========================= */

router.get(
  "/",
  protect,
  authorize(["admin"]),
  userController.getUsers
);

/* =========================
   GET SINGLE USER (ADMIN)
========================= */

router.get(
  "/:id",
  protect,
  authorize(["admin"]),
  [
    param("id").isInt().withMessage("Invalid user ID")
  ],
  validate,
  userController.getUserById
);

/* =========================
   DELETE USER (ADMIN)
========================= */

router.delete(
  "/:id",
  protect,
  authorize(["admin"]),
  [
    param("id").isInt().withMessage("Invalid user ID")
  ],
  validate,
  userController.deleteUser
);

module.exports = router;