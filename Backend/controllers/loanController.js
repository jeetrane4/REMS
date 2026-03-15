const query = require("../utils/dbQuery");

/* ==============================
APPLY FOR LOAN
============================== */

exports.applyLoan = async (req,res,next)=>{

try{

const userId = req.user.id;

const {
property_id,
loan_amount,
annual_income,
employment_type
} = req.body;

if(!property_id || !loan_amount){
return res.status(400).json({
message:"Property and loan amount required"
});
}

/* Check property exists */

const property = await query(
`SELECT property_id,title
FROM properties
WHERE property_id=$1`,
[property_id]
);

if(property.length === 0){
return res.status(404).json({
message:"Property not found"
});
}

/* Save loan application */

await query(
`
INSERT INTO loan_applications
(user_id,property_id,loan_amount,annual_income,employment_type)
VALUES($1,$2,$3,$4,$5)
`,
[userId,property_id,loan_amount,annual_income,employment_type]
);

res.status(201).json({
message:"Loan application submitted"
});

}
catch(err){
next(err);
}

};



/* ==============================
GET USER LOAN APPLICATIONS
============================== */

exports.getUserLoans = async (req,res,next)=>{

try{

const userId = req.user.id;

const loans = await query(
`
SELECT
l.loan_id,
l.loan_amount,
l.loan_status,
l.created_at,
p.title AS property
FROM loan_applications l
JOIN properties p
ON l.property_id = p.property_id
WHERE l.user_id=$1
ORDER BY l.created_at DESC
`,
[userId]
);

res.json({
count:loans.length,
loans
});

}
catch(err){
next(err);
}

};



/* ==============================
ADMIN: VIEW ALL LOANS
============================== */

exports.getAllLoans = async (req,res,next)=>{

try{

const loans = await query(
`
SELECT
l.loan_id,
l.loan_amount,
l.loan_status,
l.created_at,
u.user_name,
p.title AS property
FROM loan_applications l
JOIN users u
ON l.user_id = u.user_id
JOIN properties p
ON l.property_id = p.property_id
ORDER BY l.created_at DESC
`
);

res.json({
count:loans.length,
loans
});

}
catch(err){
next(err);
}

};



/* ==============================
ADMIN UPDATE LOAN STATUS
============================== */

exports.updateLoanStatus = async (req,res,next)=>{

try{

const { loan_id } = req.params;
const { loan_status } = req.body;

await query(
`
UPDATE loan_applications
SET loan_status=$1
WHERE loan_id=$2
`,
[loan_status,loan_id]
);

res.json({
message:"Loan status updated"
});

}
catch(err){
next(err);
}

};