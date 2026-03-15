const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/* =========================
REGISTER USER
========================= */

exports.register = async (req, res, next) => {
  try {

    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password required"
      });
    }

    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE user_email=?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users
      (user_name,user_email,user_mobile,password,role)
      VALUES (?,?,?,?,?)`,
      [name,email,mobile,hashedPassword,role || "buyer"]
    );

    const token = jwt.sign(
      { id: result.insertId, role: role || "buyer" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token
    });

  } catch (err) {
    next(err);
  }
};


/* =========================
LOGIN
========================= */

exports.login = async (req,res,next)=>{

try{

const { email,password } = req.body;

if(!email || !password){
return res.status(400).json({
message:"Email and password required"
});
}

const [users] = await db.query(
"SELECT * FROM users WHERE user_email=?",
[email]
);

if(users.length === 0){
return res.status(401).json({
message:"Invalid credentials"
});
}

const user = users[0];

if(!user.is_active){
return res.status(403).json({
message:"Account disabled"
});
}

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.status(401).json({
message:"Invalid credentials"
});
}

const token = jwt.sign(
{ id:user.user_id, role:user.role },
process.env.JWT_SECRET,
{ expiresIn:"1d" }
);

res.json({
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