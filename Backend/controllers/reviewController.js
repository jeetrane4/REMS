const query = require("../utils/dbQuery");

/* =============================
ADD REVIEW
============================= */

exports.addReview = async (req,res,next)=>{

try{

const { property_id, rating, comment } = req.body;

if(!property_id || !rating){
return res.status(400).json({
success:false,
message:"Property and rating required"
});
}

await query(
`INSERT INTO reviews(property_id,user_id,rating,comment)
VALUES($1,$2,$3,$4)`,
[property_id,req.user.id,rating,comment]
);

res.status(201).json({
success:true,
message:"Review added"
});

}
catch(err){
next(err);
}

};


/* =============================
GET PROPERTY REVIEWS
============================= */

exports.getPropertyReviews = async (req,res,next)=>{

try{

const property_id = req.params.property_id;

const reviews = await query(
`SELECT
r.*,
u.user_name
FROM reviews r
JOIN users u
ON r.user_id = u.user_id
WHERE r.property_id=$1`,
[property_id]
);

res.json({
success:true,
count:reviews.length,
data:reviews
});

}
catch(err){
next(err);
}

};