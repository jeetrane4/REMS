const query = require("../utils/dbQuery");

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
area,
latitude,
longitude
} = req.body;

if(!title || !price){
return res.status(400).json({
success:false,
message:"Title and price required"
});
}

await query(
`INSERT INTO properties
(title,description,price,city,state,address,type,listing_type,bedrooms,bathrooms,area,latitude,longitude,owner_id)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
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
latitude || null,
longitude || null,
req.user.id
]
);

res.status(201).json({
success:true,
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
listing_type,
minPrice,
maxPrice,
page = 1,
limit = 10
} = req.query;

let baseQuery = `
SELECT
p.*,
u.user_name AS owner_name,
(
SELECT image_url
FROM property_images
WHERE property_id = p.property_id
LIMIT 1
) AS image
FROM properties p
JOIN users u ON p.owner_id = u.user_id
WHERE p.verification_status='approved'
`;

const params = [];
let index = 1;

/* FILTERS */

if(city){
baseQuery += ` AND p.city=$${index++}`;
params.push(city);
}

if(type){
baseQuery += ` AND p.type=$${index++}`;
params.push(type);
}

if(listing_type){
baseQuery += ` AND p.listing_type=$${index++}`;
params.push(listing_type);
}

if(minPrice){
baseQuery += ` AND p.price >= $${index++}`;
params.push(minPrice);
}

if(maxPrice){
baseQuery += ` AND p.price <= $${index++}`;
params.push(maxPrice);
}

/* PAGINATION */

const offset = (page - 1) * limit;

baseQuery += ` ORDER BY p.listed_at DESC
LIMIT $${index++}
OFFSET $${index++}`;

params.push(limit);
params.push(offset);

const properties = await query(baseQuery,params);

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
GET PROPERTY DETAILS
============================= */

exports.getPropertyById = async (req,res,next)=>{

try{

const id = req.params.id;

const rows = await query(
`
SELECT
p.*,
u.user_name AS owner_name,
u.user_email AS owner_email
FROM properties p
JOIN users u ON p.owner_id = u.user_id
WHERE p.property_id=$1
`,
[id]
);

if(rows.length === 0){
return res.status(404).json({
success:false,
message:"Property not found"
});
}

/* increase view counter */

await query(
"UPDATE properties SET views = views + 1 WHERE property_id=$1",
[id]
);

/* get images */

const images = await query(
"SELECT image_url FROM property_images WHERE property_id=$1",
[id]
);

const property = rows[0];
property.images = images;

res.json({
success:true,
data:property
});

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

const rows = await query(
"SELECT owner_id FROM properties WHERE property_id=$1",
[propertyId]
);

if(rows.length === 0){
return res.status(404).json({
success:false,
message:"Property not found"
});
}

if(rows[0].owner_id !== req.user.id){
return res.status(403).json({
success:false,
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

await query(
`UPDATE properties
SET title=$1,
description=$2,
price=$3,
city=$4,
state=$5,
address=$6,
type=$7
WHERE property_id=$8`,
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
success:true,
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

await query(
"DELETE FROM properties WHERE property_id=$1",
[propertyId]
);

res.json({
success:true,
message:"Property deleted"
});

}
catch(err){
next(err);
}

};