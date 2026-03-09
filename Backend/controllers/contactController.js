const db = require("../config/db");

exports.sendMessage = async (req,res,next)=>{

try{

const {name,email,message} = req.body;

await db.query(
`INSERT INTO contact_messages (name,email,message)
VALUES (?,?,?)`,
[name,email,message]
);

res.json({message:"Message received"});

}
catch(err){
next(err);
}

};