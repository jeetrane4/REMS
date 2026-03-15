const db = require("../config/db");

/*
 Centralized database query helper
 Ensures consistent query handling
*/

async function query(text, params = []) {

  try {

    const res = await db.query(text, params);
    return res.rows;

  } catch (error) {

    console.error("Database Query Error:");
    console.error("Query:", text);
    console.error("Params:", params);
    console.error("Error:", error);

    throw error;
  }

}

module.exports = query;