const { query } = require("../utils/dbQuery");

/* =============================
   SEND CONTACT MESSAGE
============================= */

exports.sendMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const rows = await query(
      `INSERT INTO contact_messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, message, created_at`,
      [name, email, message]
    );

    return res.status(201).json({
      success: true,
      message: "Message received successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};