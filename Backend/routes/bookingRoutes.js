const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const bookingController = require("../controllers/bookingController");

/* =========================
CREATE BOOKING
========================= */

router.post(
"/",
protect,
authorize(["buyer"]),
bookingController.createBooking
);

/* =========================
UPDATE BOOKING STATUS
========================= */

router.put(
"/:booking_id",
protect,
authorize(["admin","seller","agent"]),
bookingController.updateBookingStatus
);

/* =========================
GET BOOKINGS
========================= */

router.get(
"/",
protect,
authorize(["admin","buyer","seller","agent"]),
bookingController.getBookings
);

module.exports = router;