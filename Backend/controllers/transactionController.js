const query = require("../utils/dbQuery");
const { calculateCommission } = require("../services/commissionService");

/* =============================
CREATE TRANSACTION
============================= */

exports.createTransaction = async (req, res, next) => {

try{

const { booking_id, amount } = req.body;

if(!booking_id || !amount){
return res.status(400).json({
success:false,
message:"Booking ID and amount required"
});
}

/* Get booking info */

const booking = await query(
`SELECT 
b.property_id,
b.user_id AS buyer_id,
p.owner_id AS seller_id
FROM bookings b
JOIN properties p ON b.property_id = p.property_id
WHERE b.booking_id=$1`,
[booking_id]
);

if(booking.length === 0){
return res.status(404).json({
success:false,
message:"Booking not found"
});
}

const { property_id, buyer_id, seller_id } = booking[0];

const commission = calculateCommission(amount);

/* Create transaction */

const transaction = await query(
`INSERT INTO transactions
(property_id,buyer_id,seller_id,amount)
VALUES ($1,$2,$3,$4)
RETURNING transaction_id`,
[property_id,buyer_id,seller_id,amount]
);

res.status(201).json({
success:true,
message:"Transaction created successfully",
transaction_id:transaction[0].transaction_id
});

}
catch(err){
next(err);
}

};



/* =============================
GET TRANSACTIONS
============================= */

exports.getTransactions = async (req,res,next)=>{

try{

const role = req.user.role;
const userId = req.user.id;

let transactions;

if(role === "admin"){

transactions = await query(`
SELECT
t.*,
p.title,
u.user_name AS buyer_name
FROM transactions t
JOIN properties p ON t.property_id = p.property_id
JOIN users u ON t.buyer_id = u.user_id
ORDER BY t.transaction_date DESC
`);

}

else if(role === "seller"){

transactions = await query(
`SELECT *
FROM transactions
WHERE seller_id=$1
ORDER BY transaction_date DESC`,
[userId]
);

}

else if(role === "buyer"){

transactions = await query(
`SELECT *
FROM transactions
WHERE buyer_id=$1
ORDER BY transaction_date DESC`,
[userId]
);

}

res.json({
success:true,
count:transactions.length,
data:transactions
});

}
catch(err){
next(err);
}

};



/* =============================
UPDATE TRANSACTION STATUS
============================= */

exports.updateTransactionStatus = async (req,res,next)=>{

try{

const { id } = req.params;
const { payment_status } = req.body;

await query(
"UPDATE transactions SET payment_status=$1 WHERE transaction_id=$2",
[payment_status,id]
);

res.json({
success:true,
message:"Transaction status updated"
});

}
catch(err){
next(err);
}

};