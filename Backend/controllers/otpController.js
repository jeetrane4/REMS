const query = require("../utils/dbQuery");
const otpService = require("../services/otpService");

/* ==============================
SEND OTP
============================== */

exports.sendOTP = async (req,res,next)=>{

try{

const { mobile } = req.body;

if(!mobile){
return res.status(400).json({
message:"Mobile number required"
});
}

const users = await query(
`SELECT user_id FROM users WHERE user_mobile=$1`,
[mobile]
);

if(users.length === 0){
return res.status(404).json({
message:"User not found"
});
}

const user_id = users[0].user_id;

const otp = otpService.generateOTP();

await otpService.saveOTP(user_id,mobile,otp);

/*
Here you integrate SMS provider
Twilio / MSG91 / Firebase
*/

console.log("OTP:",otp);

res.json({
message:"OTP sent successfully"
});

}
catch(err){
next(err);
}

};


/* ==============================
VERIFY OTP
============================== */

exports.verifyOTP = async (req,res,next)=>{

try{

const { mobile, otp } = req.body;

if(!mobile || !otp){
return res.status(400).json({
message:"Mobile and OTP required"
});
}

const record = await otpService.verifyOTP(mobile,otp);

if(!record){
return res.status(400).json({
message:"Invalid or expired OTP"
});
}

await query(
`UPDATE users
 SET is_mobile_verified=true
 WHERE user_id=$1`,
[record.user_id]
);

res.json({
message:"Mobile verified successfully"
});

}
catch(err){
next(err);
}

};