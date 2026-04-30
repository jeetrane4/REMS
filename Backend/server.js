require("dotenv").config({ path: "./Backend/.env" });

const app = require("./app");
const { testConnection, pool } = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

let server;

/* ==============================
   START SERVER
============================== */

const startServer = async () => {
  try {
    await testConnection();

    server = app.listen(PORT, () => {
      console.log(`REMS Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start REMS server:", error.message);
    process.exit(1);
  }
};

startServer();

/* ==============================
   HANDLE UNCAUGHT EXCEPTIONS
============================== */

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err.message);

  if (pool) {
    await pool.end();
  }

  process.exit(1);
});

/* ==============================
   HANDLE PROMISE REJECTIONS
============================== */

process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Promise Rejection:", err.message);

  if (server) {
    server.close(async () => {
      if (pool) {
        await pool.end();
      }
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

/* ==============================
   GRACEFUL SHUTDOWN
============================== */

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Closing REMS server...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");

      if (pool) {
        await pool.end();
        console.log("Database pool closed.");
      }

      process.exit(0);
    });
  } else {
    if (pool) {
      await pool.end();
    }

    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));