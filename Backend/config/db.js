require("dotenv").config();
const { Pool } = require("pg");

/* ==============================
DATABASE CONNECTION
============================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  },

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

/* ==============================
TEST CONNECTION
============================== */

async function testConnection() {
  try {

    const client = await pool.connect();

    const res = await client.query("SELECT NOW()");

    console.log("PostgreSQL Connected:", res.rows[0].now);

    client.release();

  } catch (err) {

    console.error("Database connection failed:", err.message);

  }
}

testConnection();

/* ==============================
POOL EVENTS
============================== */

pool.on("connect", () => {
  console.log("Database pool connected");
});

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
});

module.exports = pool;