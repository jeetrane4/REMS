const query = require("../utils/dbQuery");

/* =============================
CREATE BOOKING
============================= */

exports.createBooking = async (req,res,next)=>{

try{

const { property_id } = req.body;

if(!property_id){
return res.status(400).json({
success:false,
message:"Property ID required"
});
}

/* check property */

const property = await query(
"SELECT owner_id FROM properties WHERE property_id=$1",
[property_id]
);

if(property.length === 0){
return res.status(404).json({
success:false,
message:"Property not found"
});
}

if(property[0].owner_id === req.user.id){
return res.status(400).json({
success:false,
message:"Owner cannot book own property"
});
}

/* create booking */

await query(
"INSERT INTO bookings(property_id,user_id) VALUES($1,$2)",
[property_id,req.user.id]
);

res.status(201).json({
success:true,
message:"Booking created"
});

}
catch(err){
next(err);
}

};


/* =============================
UPDATE BOOKING STATUS
============================= */

exports.updateBookingStatus = async (req,res,next)=>{

try{

const { booking_id } = req.params;
const { status } = req.body;

await query(
"UPDATE bookings SET status=$1 WHERE booking_id=$2",
[status,booking_id]
);

res.json({
success:true,
message:"Booking updated"
});

}
catch(err){
next(err);
}

};


/* =============================
GET BOOKINGS
============================= */

exports.getBookings = async (req,res,next)=>{

try{

const bookings = await query(`
SELECT
b.booking_id,
b.status,
b.booking_date,
p.title,
u.user_name
FROM bookings b
JOIN properties p ON b.property_id = p.property_id
JOIN users u ON b.user_id = u.user_id
ORDER BY b.booking_date DESC
`);

res.json({
success:true,
count:bookings.length,
data:bookings
});

}
catch(err){
next(err);
}

};