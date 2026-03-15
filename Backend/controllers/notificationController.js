const query = require("../utils/dbQuery");

/* =============================
GET USER NOTIFICATIONS
============================= */

exports.getNotifications = async (req,res,next)=>{

try{

const notifications = await query(
`SELECT *
FROM notifications
WHERE user_id=$1
ORDER BY created_at DESC`,
[req.user.id]
);

res.json({
success:true,
count:notifications.length,
data:notifications
});

}
catch(err){
next(err);
}

};


/* =============================
MARK NOTIFICATION AS READ
============================= */

exports.markAsRead = async (req,res,next)=>{

try{

const { notification_id } = req.params;

await query(
"UPDATE notifications SET is_read=true WHERE notification_id=$1",
[notification_id]
);

res.json({
success:true,
message:"Notification marked as read"
});

}
catch(err){
next(err);
}

};