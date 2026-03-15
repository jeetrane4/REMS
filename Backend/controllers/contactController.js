const query = require("../utils/dbQuery");

exports.sendMessage = async (req,res,next)=>{

try{

const { name,email,message } = req.body;

await query(
`INSERT INTO contact_messages(name,email,message)
VALUES($1,$2,$3)`,
[name,email,message]
);

res.json({
success:true,
message:"Message received"
});

}
catch(err){
next(err);
}

};