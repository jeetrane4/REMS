const query = require("../utils/dbQuery");

/* ==============================
GET RECOMMENDED PROPERTIES
============================== */

exports.getRecommendations = async (req,res,next)=>{

try{

const userId = req.user?.id;

/* --------------------------------
 Try user preferences
-------------------------------- */

let properties = await query(
`
SELECT p.*
FROM properties p
JOIN user_preferences up
ON up.user_id=$1
WHERE
p.city = up.preferred_city
AND p.price BETWEEN up.min_budget AND up.max_budget
AND p.verification_status='approved'
LIMIT 10
`,
[userId]
);

if(properties.length > 0){
return res.json({
source:"preferences",
properties
});
}

/* --------------------------------
 Try search history
-------------------------------- */

properties = await query(
`
SELECT p.*
FROM properties p
JOIN search_logs s
ON s.user_id=$1
WHERE p.city = s.city
AND p.verification_status='approved'
ORDER BY s.created_at DESC
LIMIT 10
`,
[userId]
);

if(properties.length > 0){
return res.json({
source:"search_logs",
properties
});
}

/* --------------------------------
 Try viewed properties
-------------------------------- */

properties = await query(
`
SELECT p.*
FROM properties p
JOIN property_views v
ON v.user_id=$1
WHERE p.city = (
 SELECT city
 FROM properties
 WHERE property_id = v.property_id
 LIMIT 1
)
AND p.verification_status='approved'
LIMIT 10
`,
[userId]
);

if(properties.length > 0){
return res.json({
source:"views",
properties
});
}

/* --------------------------------
 Fallback: trending properties
-------------------------------- */

properties = await query(
`
SELECT *
FROM properties
WHERE verification_status='approved'
ORDER BY views DESC
LIMIT 10
`
);

res.json({
source:"trending",
properties
});

}
catch(err){
next(err);
}

};