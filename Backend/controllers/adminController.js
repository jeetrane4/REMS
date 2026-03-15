const query = require("../utils/dbQuery");

/* =============================
VERIFY PROPERTY
============================= */

exports.verifyProperty = async (req,res,next)=>{

try{

const { id } = req.params;
const { status } = req.body;

await query(
`UPDATE properties
SET verification_status=$1
WHERE property_id=$2`,
[status || "approved",id]
);

res.json({
success:true,
message:"Property verification updated"
});

}
catch(err){
next(err);
}

};


/* =============================
GET ALL PROPERTIES (ADMIN)
============================= */

exports.getAllProperties = async (req,res,next)=>{

try{

const properties = await query(`
SELECT
p.*,
u.user_name
FROM properties p
JOIN users u
ON p.owner_id=u.user_id
ORDER BY p.listed_at DESC
`);

res.json({
success:true,
count:properties.length,
data:properties
});

}
catch(err){
next(err);
}

};