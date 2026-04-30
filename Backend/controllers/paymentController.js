const { query, transaction } = require("../utils/dbQuery");

/* =============================
   CREATE PAYMENT
============================= */

exports.createPayment = async (req, res, next) => {
  try {
    const {
      transaction_id,
      amount_paid,
      method,
      gateway,
      gateway_transaction_id
    } = req.body;

    const userId = req.user.user_id || req.user.id;

    const result = await transaction(async (client) => {
      const transactionRows = await client.query(
        `SELECT *
         FROM transactions
         WHERE transaction_id = $1`,
        [transaction_id]
      );

      if (transactionRows.rows.length === 0) {
        const error = new Error("Transaction not found");
        error.status = 404;
        throw error;
      }

      const txn = transactionRows.rows[0];

      if (req.user.role === "buyer" && txn.buyer_id !== userId) {
        const error = new Error("You are not allowed to pay this transaction");
        error.status = 403;
        throw error;
      }

      if (Number(amount_paid) < Number(txn.amount)) {
        const error = new Error("Paid amount is less than transaction amount");
        error.status = 400;
        throw error;
      }

      const paymentRows = await client.query(
        `INSERT INTO payments
         (
          transaction_id,
          amount_paid,
          method,
          gateway,
          gateway_transaction_id,
          payment_status
         )
         VALUES ($1, $2, $3, $4, $5, 'completed')
         RETURNING *`,
        [
          transaction_id,
          amount_paid,
          method,
          gateway || null,
          gateway_transaction_id || null
        ]
      );

      await client.query(
        `UPDATE transactions
         SET payment_status = 'completed'
         WHERE transaction_id = $1`,
        [transaction_id]
      );

      await client.query(
        `INSERT INTO payment_logs
         (
          payment_id,
          transaction_id,
          gateway_response,
          status
         )
         VALUES ($1, $2, $3, $4)`,
        [
          paymentRows.rows[0].payment_id,
          transaction_id,
          JSON.stringify({
            method,
            gateway: gateway || null,
            gateway_transaction_id: gateway_transaction_id || null
          }),
          "completed"
        ]
      );

      return paymentRows.rows[0];
    });

    return res.status(201).json({
      success: true,
      message: "Payment successful",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET PAYMENTS
============================= */

exports.getPayments = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const role = req.user.role;

    let sql = `
      SELECT
        pay.payment_id,
        pay.transaction_id,
        pay.amount_paid,
        pay.method,
        pay.gateway,
        pay.gateway_transaction_id,
        pay.payment_status,
        pay.payment_date,
        t.property_id,
        t.buyer_id,
        t.seller_id,
        p.title AS property_title
      FROM payments pay
      JOIN transactions t ON pay.transaction_id = t.transaction_id
      JOIN properties p ON t.property_id = p.property_id
    `;

    const params = [];

    if (role === "buyer") {
      sql += " WHERE t.buyer_id = $1";
      params.push(userId);
    } else if (role === "seller" || role === "agent") {
      sql += " WHERE t.seller_id = $1";
      params.push(userId);
    }

    sql += " ORDER BY pay.payment_date DESC";

    const payments = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
};