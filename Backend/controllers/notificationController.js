const { query } = require("../utils/dbQuery");

/* =============================
   GET USER NOTIFICATIONS
============================= */

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const notifications = await query(
      `SELECT 
        notification_id,
        message,
        is_read,
        created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   MARK NOTIFICATION AS READ
============================= */

exports.markAsRead = async (req, res, next) => {
  try {
    const { notification_id } = req.params;
    const userId = req.user.user_id || req.user.id;

    const rows = await query(
      `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1 AND user_id = $2
       RETURNING notification_id`,
      [notification_id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (err) {
    next(err);
  }
};