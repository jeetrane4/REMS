const { query } = require("../utils/dbQuery");
const { calculateCommission } = require("../services/commissionService");

/* =============================
   CREATE TRANSACTION
============================= */

exports.createTransaction = async (req, res, next) => {
  try {
    const { property_id, buyer_id, seller_id, amount } = req.body;

    const propertyRows = await query(
      "SELECT property_id, owner_id FROM properties WHERE property_id = $1",
      [property_id]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (Number(propertyRows[0].owner_id) !== Number(seller_id)) {
      return res.status(400).json({
        success: false,
        message: "Seller does not own this property"
      });
    }

    const commission = calculateCommission(Number(amount));

    const rows = await query(
      `INSERT INTO transactions
       (property_id, buyer_id, seller_id, amount, payment_status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [property_id, buyer_id, seller_id, amount]
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: {
        ...rows[0],
        commission
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   GET TRANSACTIONS
============================= */

exports.getTransactions = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.user_id || req.user.id;

    let sql = `
      SELECT
        t.*,
        p.title AS property_title,
        buyer.user_name AS buyer_name,
        seller.user_name AS seller_name
      FROM transactions t
      JOIN properties p ON t.property_id = p.property_id
      JOIN users buyer ON t.buyer_id = buyer.user_id
      JOIN users seller ON t.seller_id = seller.user_id
    `;

    const params = [];

    if (role === "buyer") {
      sql += " WHERE t.buyer_id = $1";
      params.push(userId);
    } else if (role === "seller" || role === "agent") {
      sql += " WHERE t.seller_id = $1";
      params.push(userId);
    }

    sql += " ORDER BY t.transaction_date DESC";

    const transactions = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   UPDATE TRANSACTION STATUS
============================= */

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const rows = await query(
      `UPDATE transactions
       SET payment_status = $1
       WHERE transaction_id = $2
       RETURNING *`,
      [payment_status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction status updated successfully",
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};