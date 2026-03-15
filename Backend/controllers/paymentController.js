const query = require("../utils/dbQuery");

/* =============================
CREATE PAYMENT
============================= */

exports.createPayment = async (req,res,next)=>{

try{

const { transaction_id, amount_paid, method } = req.body;

if(!transaction_id || !amount_paid){
return res.status(400).json({
success:false,
message:"Transaction and amount required"
});
}

/* Insert payment */

await query(
`INSERT INTO payments
(transaction_id,amount_paid,method)
VALUES ($1,$2,$3)`,
[transaction_id,amount_paid,method]
);

/* Update transaction */

await query(
`UPDATE transactions
SET payment_status='Completed'
WHERE transaction_id=$1`,
[transaction_id]
);

res.status(201).json({
success:true,
message:"Payment successful"
});

}
catch(err){
next(err);
}

};



/* =============================
GET PAYMENTS
============================= */

exports.getPayments = async (req,res,next)=>{

try{

const payments = await query(`
SELECT
pay.payment_id,
pay.amount_paid,
pay.method,
pay.payment_date,
t.transaction_id
FROM payments pay
JOIN transactions t
ON pay.transaction_id = t.transaction_id
ORDER BY pay.payment_date DESC
`);

res.json({
success:true,
count:payments.length,
data:payments
});

}
catch(err){
next(err);
}

};