const db = require("../config/db");

// CREATE TRANSACTION
exports.createTransaction = async (req, res, next) => {
  try {

    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({
        message: "Booking ID and amount required"
      });
    }

    // get booking info
    const [booking] = await db.query(
      `SELECT b.property_id, b.user_id AS buyer_id, p.owner_id AS seller_id
       FROM bookings b
       JOIN properties p ON b.property_id = p.property_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const { property_id, buyer_id, seller_id } = booking[0];

    await db.query(
      `INSERT INTO transactions 
      (property_id, buyer_id, seller_id, amount) 
      VALUES (?, ?, ?, ?)`,
      [property_id, buyer_id, seller_id, amount]
    );

    res.status(201).json({
      message: "Transaction created successfully"
    });

  } catch (err) {
    next(err);
  }
};


// GET ALL TRANSACTIONS
exports.getTransactions = async (req,res,next)=>{

try{

const role = req.user.role;
const userId = req.user.id;

let query = "";
let params = [];

if(role === "admin"){

query = `
SELECT t.*, p.title, u.user_name AS buyer
FROM transactions t
JOIN properties p ON t.property_id = p.property_id
JOIN users u ON t.buyer_id = u.user_id
`;

}

else if(role === "seller"){

query = `
SELECT *
FROM transactions
WHERE seller_id=?
`;

params = [userId];

}

else if(role === "buyer"){

query = `
SELECT *
FROM transactions
WHERE buyer_id=?
`;

params = [userId];

}

const [transactions] = await db.query(query,params);

res.json(transactions);

}
catch(err){
next(err);
}

};


// UPDATE TRANSACTION STATUS
exports.updateTransactionStatus = async (req, res, next) => {
  try {

    const { id } = req.params;
    const { payment_status } = req.body;

    await db.query(
      "UPDATE transactions SET payment_status = ? WHERE transaction_id = ?",
      [payment_status, id]
    );

    res.json({
      message: "Transaction updated successfully"
    });

  } catch (err) {
    next(err);
  }
};