const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn("Email credentials missing. Email not sent.");
      return false;
    }

    await transporter.sendMail({
      from: `"REMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    return true;
  } catch (err) {
    console.error("Email error:", err.message);
    return false;
  }
};