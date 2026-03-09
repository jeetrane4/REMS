const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const bookingController = require("../controllers/bookingController");

router.post(
  "/",
  protect,
  role(["buyer"]),
  bookingController.createBooking
);

router.put(
  "/:booking_id",
  protect,
  role(["admin","seller"]),
  bookingController.updateBookingStatus
);

router.get(
  "/",
  protect,
  role(["admin","buyer","seller","agent"]),
  bookingController.getBookings
);

module.exports = router;