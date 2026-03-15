require("dotenv").config();
const db = require("./config/db");

async function testDatabase() {

try{

const result = await db.query("SELECT NOW()");

console.log("Database Connected");
console.log(result.rows);

process.exit();

}catch(err){

console.error("Database Connection Failed:",err);
process.exit(1);

}

}

testDatabase();