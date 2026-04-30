const { query } = require("../utils/dbQuery");
const otpService = require("../services/otpService");

/* ==============================
   SEND OTP
============================== */

exports.sendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const users = await query(
      `SELECT user_id, user_mobile
       FROM users
       WHERE user_mobile = $1`,
      [mobile]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user found with this mobile number"
      });
    }

    const user = users[0];
    const otp = otpService.generateOTP();

    await otpService.saveOTP(user.user_id, mobile, otp);

    console.log("OTP:", otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (err) {
    next(err);
  }
};

/* ==============================
   VERIFY OTP
============================== */

exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    const record = await otpService.verifyOTP(mobile, otp);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mobile verified successfully"
    });
  } catch (err) {
    next(err);
  }
};