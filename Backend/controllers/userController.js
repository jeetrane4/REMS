const query = require("../utils/dbQuery");

exports.getUsers = async (req,res,next)=>{

try{

const users = await query(`
SELECT
user_id,
user_name,
user_email,
role,
is_active,
created_at
FROM users
ORDER BY created_at DESC
`);

res.json({
success:true,
count:users.length,
data:users
});

}
catch(err){
next(err);
}

};