const { query } = require("../utils/dbQuery");

/* =============================
   GET ALL USERS - ADMIN
============================= */

exports.getUsers = async (req, res, next) => {
  try {
    const users = await query(`
      SELECT
        user_id,
        user_name,
        user_email,
        user_mobile,
        role,
        is_active,
        is_mobile_verified,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET SINGLE USER - ADMIN
============================= */

exports.getUserById = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT
        user_id,
        user_name,
        user_email,
        user_mobile,
        role,
        is_active,
        is_mobile_verified,
        created_at
       FROM users
       WHERE user_id = $1`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET PROFILE - SELF
============================= */

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const users = await query(
      `SELECT
        user_id,
        user_name,
        user_email,
        user_mobile,
        role,
        is_active,
        is_mobile_verified,
        created_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   UPDATE PROFILE - SELF
============================= */

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { name, mobile } = req.body;

    const users = await query(
      `UPDATE users
       SET
        user_name = COALESCE($1, user_name),
        user_mobile = COALESCE($2, user_mobile)
       WHERE user_id = $3
       RETURNING user_id, user_name, user_email, user_mobile, role, is_active, is_mobile_verified, created_at`,
      [name || null, mobile || null, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: users[0]
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   DELETE USER - ADMIN
============================= */

exports.deleteUser = async (req, res, next) => {
  try {
    const rows = await query(
      `DELETE FROM users
       WHERE user_id = $1
       RETURNING user_id`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};