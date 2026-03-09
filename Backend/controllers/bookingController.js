const db = require("../config/db");

// CREATE BOOKING
exports.createBooking = async (req, res, next) => {
  try {

    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({
        message: "Property ID required"
      });
    }

    await db.query(
      "INSERT INTO bookings (property_id, user_id) VALUES (?, ?)",
      [property_id, req.user.id]
    );

    res.status(201).json({
      message: "Booking created successfully"
    });

  } catch (err) {
    next(err);
  }
};


// UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res, next) => {
  try {

    const { booking_id } = req.params;
    const { status } = req.body;

    await db.query(
      "UPDATE bookings SET status = ? WHERE booking_id = ?",
      [status, booking_id]
    );

    res.json({
      message: "Booking status updated"
    });

  } catch (err) {
    next(err);
  }
};


// GET BOOKINGS
exports.getBookings = async (req, res, next) => {
  try {

    const [bookings] = await db.query(`
      SELECT 
        b.booking_id,
        b.status,
        b.booking_date,
        b.property_id,
        p.title,
        u.user_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN users u ON b.user_id = u.user_id
    `);

    res.json(bookings);

  } catch (err) {
    next(err);
  }
};