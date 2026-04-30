require("dotenv").config({ path: "./Backend/.env" });

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in Backend/.env");
}

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on("connect", () => {
  console.log("PostgreSQL pool connected");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
};

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    console.log("PostgreSQL connected successfully:", result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};