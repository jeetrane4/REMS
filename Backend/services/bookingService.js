const query = require("../utils/dbQuery");

/* =============================
CREATE BOOKING SERVICE
============================= */

exports.createBookingService = async (property_id, buyer_id) => {

const booking = await query(
"INSERT INTO bookings(property_id,user_id) VALUES($1,$2) RETURNING booking_id",
[property_id,buyer_id]
);

return booking[0].booking_id;

};