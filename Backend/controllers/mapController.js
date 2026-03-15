const query = require("../utils/dbQuery");

/* ==============================
MAP SEARCH
============================== */

exports.searchNearbyProperties = async (req,res,next)=>{

try{

const { lat, lng, radius = 5 } = req.query;

if(!lat || !lng){
return res.status(400).json({
message:"Latitude and longitude required"
});
}

/*
Distance formula using Haversine
*/

const properties = await query(
`
SELECT
p.property_id,
p.title,
p.price,
p.city,
p.latitude,
p.longitude,

(
6371 * acos(
cos(radians($1)) *
cos(radians(p.latitude)) *
cos(radians(p.longitude) - radians($2)) +
sin(radians($1)) *
sin(radians(p.latitude))
)
) AS distance

FROM properties p

WHERE p.verification_status='approved'

HAVING distance < $3

ORDER BY distance
`,
[lat,lng,radius]
);

res.json({
count:properties.length,
properties
});

}
catch(err){
next(err);
}

};