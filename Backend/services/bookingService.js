const { query } = require("../utils/dbQuery");

exports.createBookingService = async (propertyId, buyerId) => {
  const rows = await query(
    `INSERT INTO bookings (property_id, user_id)
     VALUES ($1, $2)
     RETURNING booking_id, property_id, user_id, status, booking_date`,
    [propertyId, buyerId]
  );

  return rows[0];
};

exports.getBookingById = async (bookingId) => {
  const rows = await query(
    "SELECT * FROM bookings WHERE booking_id = $1",
    [bookingId]
  );

  return rows[0] || null;
};