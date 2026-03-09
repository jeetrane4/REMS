const db = require("../config/db");

exports.getNotifications = async (req, res, next) => {
  try {

    const user_id = req.user.id;

    const [notifications] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    res.json(notifications);

  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {

    const { notification_id } = req.params;

    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = ?",
      [notification_id]
    );

    res.json({ message: "Notification marked as read" });

  } catch (err) {
    next(err);
  }
};