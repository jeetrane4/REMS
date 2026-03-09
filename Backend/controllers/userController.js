const db = require("../config/db");

exports.getUsers = async (req, res, next) => {

  try {

    const [users] = await db.query(`
      SELECT 
        user_id,
        user_name,
        user_email,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(users);

  } catch (err) {
    next(err);
  }

};