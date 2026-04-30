require("dotenv").config({ path: "./Backend/.env" });

const { query, testConnection } = require("./config/db");

async function testDatabase() {
  try {
    const isConnected = await testConnection();

    if (!isConnected) {
      throw new Error("Initial connection test failed");
    }

    const result = await query("SELECT NOW() AS current_time");

    console.log("Database Connected Successfully");
    console.log("Current Time:", result.rows[0].current_time);

    process.exit(0);
  } catch (err) {
    console.error("Database Connection Failed:", err.message);
    process.exit(1);
  }
}

testDatabase();