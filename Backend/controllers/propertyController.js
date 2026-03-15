const db = require("../config/db");

/* =============================
CREATE PROPERTY
============================= */

exports.createProperty = async (req,res,next)=>{

try{

const {
title,
description,
price,
city,
state,
address,
type,
listing_type,
bedrooms,
bathrooms,
area
} = req.body;

if(!title || !price){
return res.status(400).json({
message:"Title and price required"
});
}

await db.query(
`INSERT INTO properties
(title,description,price,city,state,address,type,listing_type,bedrooms,bathrooms,area,owner_id)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
[
title,
description,
price,
city,
state,
address,
type,
listing_type || "sale",
bedrooms,
bathrooms,
area,
req.user.id
]
);

res.status(201).json({
message:"Property created successfully"
});

}
catch(err){
next(err);
}

};


/* =============================
GET PROPERTIES
============================= */

exports.getProperties = async (req,res,next)=>{

try{

const {
city,
type,
minPrice,
maxPrice,
listing_type,
page = 1,
limit = 10
} = req.query;

let query = `
SELECT
p.*,
u.user_name AS owner_name,
pi.image_url AS image
FROM properties p
JOIN users u ON p.owner_id = u.user_id
LEFT JOIN property_images pi
ON p.property_id = pi.property_id
WHERE p.verification_status='approved'
`;

const params = [];

if(city){
query += " AND p.city=?";
params.push(city);
}

if(type){
query += " AND p.type=?";
params.push(type);
}

if(listing_type){
query += " AND p.listing_type=?";
params.push(listing_type);
}

if(minPrice){
query += " AND p.price>=?";
params.push(minPrice);
}

if(maxPrice){
query += " AND p.price<=?";
params.push(maxPrice);
}

query += " ORDER BY p.listed_at DESC";

query += " LIMIT ? OFFSET ?";

params.push(parseInt(limit));
params.push((page-1)*limit);

const [properties] = await db.query(query,params);

res.json(properties);

}
catch(err){
next(err);
}

};


/* =============================
GET PROPERTY DETAILS
============================= */

exports.getPropertyById = async (req,res,next)=>{

try{

const id = req.params.id;

const [rows] = await db.query(
`
SELECT
p.*,
u.user_name AS owner_name
FROM properties p
JOIN users u ON p.owner_id = u.user_id
WHERE p.property_id=?
`,
[id]
);

if(rows.length === 0){
return res.status(404).json({
message:"Property not found"
});
}

await db.query(
"UPDATE properties SET views = views + 1 WHERE property_id=?",
[id]
);

const [images] = await db.query(
"SELECT image_url FROM property_images WHERE property_id=?",
[id]
);

const property = rows[0];
property.images = images;

res.json(property);

}
catch(err){
next(err);
}

};


/* =============================
UPDATE PROPERTY
============================= */

exports.updateProperty = async (req,res,next)=>{

try{

const propertyId = req.params.id;

const [rows] = await db.query(
"SELECT owner_id FROM properties WHERE property_id=?",
[propertyId]
);

if(rows.length === 0){
return res.status(404).json({
message:"Property not found"
});
}

if(rows[0].owner_id !== req.user.id){
return res.status(403).json({
message:"Not allowed"
});
}

const {
title,
description,
price,
city,
state,
address,
type
} = req.body;

await db.query(
`UPDATE properties
SET title=?,description=?,price=?,city=?,state=?,address=?,type=?
WHERE property_id=?`,
[
title,
description,
price,
city,
state,
address,
type,
propertyId
]
);

res.json({
message:"Property updated"
});

}
catch(err){
next(err);
}

};


/* =============================
DELETE PROPERTY
============================= */

exports.deleteProperty = async (req,res,next)=>{

try{

const propertyId = req.params.id;

await db.query(
"DELETE FROM properties WHERE property_id=?",
[propertyId]
);

res.json({
message:"Property deleted"
});

}
catch(err){
next(err);
}

};