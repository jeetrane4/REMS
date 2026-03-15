const query = require("../utils/dbQuery");

/* ==============================
GENERATE OTP
============================== */

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ==============================
SAVE OTP
============================== */

exports.saveOTP = async (user_id, mobile, otp) => {

  const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await query(
    `INSERT INTO otp_verifications(user_id,mobile,otp_code,expires_at)
     VALUES($1,$2,$3,$4)`,
    [user_id, mobile, otp, expires_at]
  );
};

/* ==============================
VERIFY OTP
============================== */

exports.verifyOTP = async (mobile, otp) => {

  const records = await query(
    `SELECT *
     FROM otp_verifications
     WHERE mobile=$1
     AND otp_code=$2
     AND is_verified=false
     ORDER BY created_at DESC
     LIMIT 1`,
    [mobile, otp]
  );

  if (records.length === 0) return false;

  const record = records[0];

  if (new Date() > new Date(record.expires_at)) {
    return false;
  }

  await query(
    `UPDATE otp_verifications
     SET is_verified=true
     WHERE otp_id=$1`,
    [record.otp_id]
  );

  return record;
};