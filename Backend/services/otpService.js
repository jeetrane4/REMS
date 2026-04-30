const { query } = require("../utils/dbQuery");

/* ==============================
   GENERATE OTP
============================== */

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ==============================
   SAVE OTP
============================== */

exports.saveOTP = async (userId, mobile, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const rows = await query(
    `INSERT INTO otp_verifications (user_id, mobile, otp_code, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING otp_id, user_id, mobile, expires_at`,
    [userId, mobile, otp, expiresAt]
  );

  return rows[0];
};

/* ==============================
   VERIFY OTP
============================== */

exports.verifyOTP = async (mobile, otp) => {
  const records = await query(
    `SELECT *
     FROM otp_verifications
     WHERE mobile = $1
       AND otp_code = $2
       AND is_verified = false
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [mobile, otp]
  );

  if (records.length === 0) {
    return null;
  }

  const record = records[0];

  await query(
    `UPDATE otp_verifications
     SET is_verified = true
     WHERE otp_id = $1`,
    [record.otp_id]
  );

  if (record.user_id) {
    await query(
      `UPDATE users
       SET is_mobile_verified = true
       WHERE user_id = $1`,
      [record.user_id]
    );
  }

  return record;
};