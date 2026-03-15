const query = require("../utils/dbQuery");

/* =============================
DASHBOARD STATS
============================= */

exports.getDashboardStats = async (req,res,next)=>{

try{

const userId = req.user.id;
const role = req.user.role;

let summary = {};

if(role === "buyer"){

const bookings = await query(
"SELECT COUNT(*) AS total_bookings FROM bookings WHERE user_id=$1",
[userId]
);

summary = {
totalBookings: Number(bookings[0].total_bookings)
};

}

else if(role === "seller" || role === "agent"){

const properties = await query(
"SELECT COUNT(*) AS total_properties FROM properties WHERE owner_id=$1",
[userId]
);

const views = await query(
"SELECT COALESCE(SUM(views),0) AS total_views FROM properties WHERE owner_id=$1",
[userId]
);

summary = {
totalProperties:Number(properties[0].total_properties),
totalViews:Number(views[0].total_views)
};

}

else if(role === "admin"){

const [users,properties,bookings] = await Promise.all([

query("SELECT COUNT(*) AS total_users FROM users"),

query("SELECT COUNT(*) AS total_properties FROM properties"),

query("SELECT COUNT(*) AS total_bookings FROM bookings")

]);

summary = {
totalUsers:Number(users[0].total_users),
totalProperties:Number(properties[0].total_properties),
totalBookings:Number(bookings[0].total_bookings)
};

}

res.json({
success:true,
data:summary
});

}
catch(err){
next(err);
}

};


/* =============================
HOMEPAGE STATS
============================= */

exports.getHomepageStats = async (req,res,next)=>{

try{

const [properties,users,cities] = await Promise.all([

query("SELECT COUNT(*) AS total_properties FROM properties"),

query("SELECT COUNT(*) AS total_users FROM users"),

query("SELECT COUNT(DISTINCT city) AS total_cities FROM properties")

]);

res.json({
success:true,
data:{
totalProperties:Number(properties[0].total_properties),
totalUsers:Number(users[0].total_users),
totalCities:Number(cities[0].total_cities)
}
});

}
catch(err){
next(err);
}

};


/* =============================
RECENT ACTIVITY
============================= */

exports.getRecentActivity = async (req,res,next)=>{

try{

const activities = [
{
title:"New Booking",
description:"A property visit was scheduled",
time:"2 hours ago"
},
{
title:"Property Added",
description:"Seller listed a new property",
time:"5 hours ago"
},
{
title:"User Registered",
description:"New user joined platform",
time:"1 day ago"
}
];

res.json({
success:true,
data:activities
});

}
catch(err){
next(err);
}

};