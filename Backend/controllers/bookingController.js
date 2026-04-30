const { query } = require("../utils/dbQuery");

/* =============================
   CREATE BOOKING
============================= */

exports.createBooking = async (req, res, next) => {
  try {
    const { property_id } = req.body;
    const userId = req.user.user_id || req.user.id;

    const property = await query(
      "SELECT owner_id, status FROM properties WHERE property_id = $1",
      [property_id]
    );

    if (property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (property[0].owner_id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own property"
      });
    }

    if (property[0].status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Property is not available for booking"
      });
    }

    const existing = await query(
      `SELECT booking_id 
       FROM bookings 
       WHERE property_id = $1 AND user_id = $2 AND status != 'cancelled'`,
      [property_id, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this property"
      });
    }

    const rows = await query(
      `INSERT INTO bookings (property_id, user_id)
       VALUES ($1, $2)
       RETURNING booking_id, status, booking_date`,
      [property_id, userId]
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   UPDATE BOOKING STATUS
============================= */

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { booking_id } = req.params;
    const { status } = req.body;

    const booking = await query(
      `SELECT b.*, p.owner_id 
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       WHERE b.booking_id = $1`,
      [booking_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const userId = req.user.user_id || req.user.id;

    if (
      req.user.role !== "admin" &&
      booking[0].owner_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking"
      });
    }

    const rows = await query(
      `UPDATE bookings
       SET status = $1
       WHERE booking_id = $2
       RETURNING booking_id, status`,
      [status, booking_id]
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET BOOKINGS
============================= */

exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const role = req.user.role;

    let queryText = `
      SELECT
        b.booking_id,
        b.status,
        b.booking_date,
        p.property_id,
        p.title,
        u.user_name AS buyer_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
      JOIN users u ON b.user_id = u.user_id
    `;

    const params = [];

    if (role === "buyer") {
      queryText += " WHERE b.user_id = $1";
      params.push(userId);
    } else if (role === "seller" || role === "agent") {
      queryText += `
        WHERE p.owner_id = $1
      `;
      params.push(userId);
    }

    queryText += " ORDER BY b.booking_date DESC";

    const bookings = await query(queryText, params);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};