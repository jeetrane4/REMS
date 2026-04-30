const express = require("express");
const { body, param } = require("express-validator");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const bookingController = require("../controllers/bookingController");

/* =========================
   CREATE BOOKING
========================= */

router.post(
  "/",
  protect,
  authorize(["buyer"]),
  [
    body("property_id")
      .isInt()
      .withMessage("Valid property ID is required")
  ],
  validate,
  bookingController.createBooking
);

/* =========================
   UPDATE BOOKING STATUS
========================= */

router.patch(
  "/:booking_id",
  protect,
  authorize(["admin", "seller", "agent"]),
  [
    param("booking_id")
      .isInt()
      .withMessage("Invalid booking ID"),

    body("status")
      .isIn(["pending", "confirmed", "cancelled"])
      .withMessage("Invalid booking status")
  ],
  validate,
  bookingController.updateBookingStatus
);

/* =========================
   GET BOOKINGS
========================= */

router.get(
  "/",
  protect,
  authorize(["admin", "buyer", "seller", "agent"]),
  bookingController.getBookings
);

module.exports = router;