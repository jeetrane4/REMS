const { query: dbQuery, pool } = require("../config/db");

/*
  Centralized database query helper
  Handles queries + transactions + errors
*/

/* ==============================
   BASIC QUERY
============================== */

const query = async (text, params = []) => {
  try {
    const result = await dbQuery(text, params);
    return result.rows;
  } catch (error) {
    console.error("DB QUERY ERROR");
    console.error("Query:", text);
    console.error("Params:", params);
    console.error("Error:", error.message);
    throw error;
  }
};

/* ==============================
   TRANSACTION SUPPORT
============================== */

const transaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");
    return result;

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("DB TRANSACTION ERROR:", error.message);
    throw error;

  } finally {
    client.release();
  }
};

module.exports = {
  query,
  transaction
};