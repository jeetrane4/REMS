const query = require("../utils/dbQuery");

/* ==============================
GET ANALYTICS DASHBOARD
============================== */

exports.getAnalytics = async (req,res,next)=>{

try{

/* ----------------------------
 Most viewed properties
-----------------------------*/

const mostViewed = await query(
`
SELECT
p.property_id,
p.title,
p.city,
p.views
FROM properties p
ORDER BY p.views DESC
LIMIT 5
`
);

/* ----------------------------
 Top cities
-----------------------------*/

const topCities = await query(
`
SELECT
city,
COUNT(*) AS total_properties
FROM properties
GROUP BY city
ORDER BY total_properties DESC
LIMIT 5
`
);

/* ----------------------------
 Search trends
-----------------------------*/

const searchTrends = await query(
`
SELECT
city,
COUNT(*) AS searches
FROM search_logs
GROUP BY city
ORDER BY searches DESC
LIMIT 5
`
);

/* ----------------------------
User activity
-----------------------------*/

const userActivity = await query(
`
SELECT
DATE(created_at) AS date,
COUNT(*) AS new_users
FROM users
GROUP BY date
ORDER BY date DESC
LIMIT 7
`
);

/* ----------------------------
Revenue analytics
-----------------------------*/

const revenue = await query(
`
SELECT
SUM(amount) AS total_revenue
FROM transactions
WHERE payment_status='Completed'
`
);

res.json({

mostViewedProperties: mostViewed,
topCities,
searchTrends,
userActivity,
revenue: revenue[0]?.total_revenue || 0

});

}
catch(err){
next(err);
}

};