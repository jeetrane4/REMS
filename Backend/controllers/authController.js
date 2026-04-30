const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../utils/dbQuery");
const otpService = require("../services/otpService");

/* =========================
   GENERATE TOKEN
========================= */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      user_id: user.user_id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/* =========================
   REGISTER USER
========================= */

exports.register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    const existingUser = await query(
      "SELECT user_id FROM users WHERE user_email = $1",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "buyer";

    const users = await query(
      `INSERT INTO users 
       (user_name, user_email, user_mobile, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, user_name, user_email, user_mobile, role, is_active, created_at`,
      [name, email, mobile || null, hashedPassword, userRole]
    );

    const user = users[0];

    if (mobile && otpService?.generateOTP && otpService?.saveOTP) {
      const otp = otpService.generateOTP();
      await otpService.saveOTP(user.user_id, mobile, otp);
      console.log("Registration OTP:", otp);
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        mobile: user.user_mobile,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   LOGIN USER
========================= */

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const users = await query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is disabled. Please contact admin."
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        mobile: user.user_mobile,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   GET CURRENT USER
========================= */

exports.getCurrentUser = async (req, res, next) => {
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
      [req.user.user_id || req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        mobile: user.user_mobile,
        role: user.role,
        is_active: user.is_active,
        is_mobile_verified: user.is_mobile_verified,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   LOGOUT USER
========================= */

exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful. Please remove token from frontend storage."
  });
};