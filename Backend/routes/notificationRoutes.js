const express = require("express");
const { param } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const notificationController = require("../controllers/notificationController");

/* =========================
   GET USER NOTIFICATIONS
========================= */

router.get(
  "/",
  protect,
  notificationController.getNotifications
);

/* =========================
   MARK NOTIFICATION AS READ
========================= */

router.patch(
  "/:notification_id/read",
  protect,
  [
    param("notification_id")
      .isInt()
      .withMessage("Invalid notification ID")
  ],
  validate,
  notificationController.markAsRead
);

module.exports = router;