const db = require("../config/db");

exports.createBookingService = (property_id, buyer_id, seller_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO bookings (property_id, buyer_id, seller_id) VALUES (?, ?, ?)",
      [property_id, buyer_id, seller_id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      }
    );
  });
};