const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const query = require("../utils/dbQuery");
const otpService = require("../services/otpService");

/* =========================
REGISTER USER
========================= */

exports.register = async (req, res, next) => {

  try {

    const { name, email, mobile, password, role } = req.body;

    const existing = await query(
      "SELECT user_id FROM users WHERE user_email=$1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = await query(
      `INSERT INTO users
      (user_name,user_email,user_mobile,password,role)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING user_id`,
      [name, email, mobile, hashedPassword, role || "buyer"]
    );

    const otp = otpService.generateOTP();
    await otpService.saveOTP(users[0].user_id, mobile, otp);
    console.log("OTP:", otp);

    const token = jwt.sign(
      { id: users[0].user_id, role: role || "buyer" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token
    });

  } catch (err) {
    next(err);
  }

};


/* =========================
LOGIN USER
========================= */

exports.login = async (req,res,next)=>{

try{

const { email,password } = req.body;

const users = await query(
"SELECT * FROM users WHERE user_email=$1",
[email]
);

if(users.length === 0){
return res.status(401).json({
success:false,
message:"Invalid credentials"
});
}

const user = users[0];

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.status(401).json({
success:false,
message:"Invalid credentials"
});
}

const token = jwt.sign(
{ id:user.user_id, role:user.role },
process.env.JWT_SECRET,
{ expiresIn:"1d" }
);

res.json({
success:true,
token,
user:{
id:user.user_id,
name:user.user_name,
email:user.user_email,
mobile:user.user_mobile,
role:user.role
}
});

}
catch(err){
next(err);
}

};


/* =========================
GET CURRENT USER
========================= */

exports.getCurrentUser = async (req,res,next)=>{

try{

const users = await query(
`SELECT
user_id,
user_name,
user_email,
user_mobile,
role
FROM users
WHERE user_id=$1`,
[req.user.id]
);

if(users.length === 0){
return res.status(404).json({
success:false,
message:"User not found"
});
}

res.json({
success:true,
user:users[0]
});

}
catch(err){
next(err);
}

};