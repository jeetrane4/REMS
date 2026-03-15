const query = require("../utils/dbQuery");

/* ==============================
COMPARE PROPERTIES
============================== */

exports.compareProperties = async (req,res,next)=>{

try{

const { property_ids } = req.body;

if(!property_ids || !Array.isArray(property_ids) || property_ids.length < 2){
return res.status(400).json({
message:"Provide at least 2 property IDs for comparison"
});
}

/*
Fetch selected properties
*/

const properties = await query(
`
SELECT
property_id,
title,
price,
city,
state,
type,
listing_type,
bedrooms,
bathrooms,
area,
address,
latitude,
longitude,
status
FROM properties
WHERE property_id = ANY($1)
`,
[property_ids]
);

/*
Fetch images
*/

const images = await query(
`
SELECT property_id,image_url
FROM property_images
WHERE property_id = ANY($1)
`,
[property_ids]
);

/*
Attach images to properties
*/

const imageMap = {};

images.forEach(img=>{
if(!imageMap[img.property_id]){
imageMap[img.property_id] = [];
}
imageMap[img.property_id].push(img.image_url);
});

const result = properties.map(p=>({
...p,
images: imageMap[p.property_id] || []
}));

res.json({
count: result.length,
properties: result
});

}
catch(err){
next(err);
}

};