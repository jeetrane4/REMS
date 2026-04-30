const { query } = require("../utils/dbQuery");

exports.applyLoan = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const {
      property_id,
      loan_amount,
      annual_income,
      employment_type
    } = req.body;

    const property = await query(
      `SELECT property_id, title, price
       FROM properties
       WHERE property_id = $1`,
      [property_id]
    );

    if (property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const rows = await query(
      `INSERT INTO loan_applications
       (user_id, property_id, loan_amount, annual_income, employment_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        userId,
        property_id,
        loan_amount,
        annual_income || null,
        employment_type || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Loan application submitted successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserLoans = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const loans = await query(
      `SELECT
        l.loan_id,
        l.property_id,
        l.loan_amount,
        l.annual_income,
        l.employment_type,
        l.loan_status,
        l.created_at,
        p.title AS property_title,
        p.price AS property_price
       FROM loan_applications l
       JOIN properties p ON l.property_id = p.property_id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllLoans = async (req, res, next) => {
  try {
    const loans = await query(
      `SELECT
        l.loan_id,
        l.user_id,
        l.property_id,
        l.loan_amount,
        l.annual_income,
        l.employment_type,
        l.loan_status,
        l.created_at,
        u.user_name,
        u.user_email,
        p.title AS property_title
       FROM loan_applications l
       JOIN users u ON l.user_id = u.user_id
       JOIN properties p ON l.property_id = p.property_id
       ORDER BY l.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (err) {
    next(err);
  }
};

exports.updateLoanStatus = async (req, res, next) => {
  try {
    const { loan_id } = req.params;
    const { loan_status } = req.body;

    const rows = await query(
      `UPDATE loan_applications
       SET loan_status = $1
       WHERE loan_id = $2
       RETURNING *`,
      [loan_status, loan_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Loan status updated successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};