const db = require("../config/db");

/* ==============================
DASHBOARD SUMMARY
============================== */

const db = require("../config/db");

/* =============================
DASHBOARD STATS
============================= */

exports.getDashboardStats = async (req,res,next)=>{

try{

const userId = req.user.id;
const role = req.user.role;

let summary = {};

if(role === "buyer"){

const [[bookings]] = await db.query(
"SELECT COUNT(*) AS totalBookings FROM bookings WHERE user_id=?",
[userId]
);

summary = {
totalBookings: bookings.totalBookings
};

}

else if(role === "seller" || role === "agent"){

const [[properties]] = await db.query(
"SELECT COUNT(*) AS totalProperties FROM properties WHERE owner_id=?",
[userId]
);

const [[views]] = await db.query(
"SELECT SUM(views) AS totalViews FROM properties WHERE owner_id=?",
[userId]
);

summary = {
totalProperties: properties.totalProperties,
totalViews: views.totalViews || 0
};

}

else if(role === "admin"){

const [
[[users]],
[[properties]],
[[bookings]]
] = await Promise.all([
db.query("SELECT COUNT(*) AS totalUsers FROM users"),
db.query("SELECT COUNT(*) AS totalProperties FROM properties"),
db.query("SELECT COUNT(*) AS totalBookings FROM bookings")
]);

summary = {
totalUsers: users.totalUsers,
totalProperties: properties.totalProperties,
totalBookings: bookings.totalBookings
};

}

res.json(summary);

}
catch(err){
next(err);
}

};


/* ==============================
HOMEPAGE STATS
============================== */

exports.getHomepageStats = async (req,res,next)=>{

try{

const [
[[properties]],
[[users]],
[[cities]]
] = await Promise.all([

db.query("SELECT COUNT(*) AS totalProperties FROM properties"),

db.query("SELECT COUNT(*) AS totalUsers FROM users"),

db.query("SELECT COUNT(DISTINCT city) AS totalCities FROM properties")

]);

res.json({
totalProperties: properties.totalProperties,
totalUsers: users.totalUsers,
totalCities: cities.totalCities
});

}
catch(err){
next(err);
}

};


/* ==============================
RECENT ACTIVITY
============================== */

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

res.json(activities);

}
catch(err){
next(err);
}

};