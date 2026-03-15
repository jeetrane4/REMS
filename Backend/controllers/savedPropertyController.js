const query = require("../utils/dbQuery");

/* =============================
SAVE PROPERTY
============================= */

exports.saveProperty = async (req,res,next)=>{

try{

const { property_id } = req.body;

if(!property_id){
return res.status(400).json({
success:false,
message:"Property ID required"
});
}

const existing = await query(
`SELECT id
FROM saved_properties
WHERE user_id=$1 AND property_id=$2`,
[req.user.id,property_id]
);

if(existing.length > 0){
return res.status(400).json({
success:false,
message:"Property already saved"
});
}

await query(
"INSERT INTO saved_properties(user_id,property_id) VALUES($1,$2)",
[req.user.id,property_id]
);

res.status(201).json({
success:true,
message:"Property saved successfully"
});

}
catch(err){
next(err);
}

};


/* =============================
GET SAVED PROPERTIES
============================= */

exports.getSavedProperties = async (req,res,next)=>{

try{

const properties = await query(
`
SELECT
p.property_id,
p.title,
p.city,
p.price,
p.type,
p.status
FROM saved_properties sp
JOIN properties p
ON sp.property_id=p.property_id
WHERE sp.user_id=$1
`,
[req.user.id]
);

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


/* =============================
REMOVE SAVED PROPERTY
============================= */

exports.removeSavedProperty = async (req,res,next)=>{

try{

const { property_id } = req.params;

await query(
`DELETE FROM saved_properties
WHERE user_id=$1 AND property_id=$2`,
[req.user.id,property_id]
);

res.json({
success:true,
message:"Saved property removed"
});

}
catch(err){
next(err);
}

};