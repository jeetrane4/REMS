const db = require("../config/db");

// CREATE PAYMENT
exports.createPayment = async (req, res, next) => {
  try {

    const { transaction_id, amount_paid, method } = req.body;

    if (!transaction_id || !amount_paid || !method) {
      return res.status(400).json({
        message: "Transaction ID, amount and method required"
      });
    }

    await db.query(
      `INSERT INTO payments 
      (transaction_id, amount_paid, method) 
      VALUES (?, ?, ?)`,
      [transaction_id, amount_paid, method]
    );

    await db.query(
      `UPDATE transactions 
      SET payment_status="Completed"
      WHERE transaction_id=?`,
      [transaction_id]
    );

    res.status(201).json({
      message: "Payment created successfully"
    });

  } catch (err) {
    next(err);
  }
};


// GET ALL PAYMENTS
exports.getPayments = async (req, res, next) => {
  try {

    const [payments] = await db.query(`
      SELECT 
        pay.payment_id,
        pay.amount_paid,
        pay.method,
        pay.payment_date,
        t.transaction_id
      FROM payments pay
      JOIN transactions t ON pay.transaction_id = t.transaction_id
    `);

    res.json(payments);

  } catch (err) {
    next(err);
  }
};