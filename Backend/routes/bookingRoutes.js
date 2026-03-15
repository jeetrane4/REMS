const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const bookingController = require("../controllers/bookingController");

/* =========================
CREATE BOOKING
========================= */

router.post(
  "/",
  protect,
  role(["buyer"]),
  bookingController.createBooking
);

/* =========================
UPDATE BOOKING STATUS
========================= */

router.put(
  "/:booking_id",
  protect,
  role(["admin","seller","agent"]),
  bookingController.updateBookingStatus
);

/* =========================
GET BOOKINGS
========================= */

router.get(
  "/",
  protect,
  role(["admin","buyer","seller","agent"]),
  bookingController.getBookings
);

module.exports = router;