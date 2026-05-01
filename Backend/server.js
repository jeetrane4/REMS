require("dotenv").config({ path: "./Backend/.env" });

const app = require("./app");
const { testConnection, pool } = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

let server = null;

/* ==============================
   START SERVER ONLY LOCALLY
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

/*
  IMPORTANT:
  - In local development, we start the server normally.
  - On Vercel/production, Vercel imports this file and uses exported app.
  - So we should NOT call app.listen() in production.
*/

if (process.env.NODE_ENV !== "production") {
  startServer();
}

/* ==============================
   HANDLE UNCAUGHT EXCEPTIONS
============================== */

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err.message);

  try {
    if (pool && process.env.NODE_ENV !== "production") {
      await pool.end();
    }
  } catch (closeError) {
    console.error("Error closing database pool:", closeError.message);
  }

  process.exit(1);
});

/* ==============================
   HANDLE PROMISE REJECTIONS
============================== */

process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Promise Rejection:", err.message);

  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }

  if (server) {
    server.close(async () => {
      try {
        if (pool) {
          await pool.end();
        }
      } catch (closeError) {
        console.error("Error closing database pool:", closeError.message);
      }

      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

/* ==============================
   GRACEFUL SHUTDOWN - LOCAL ONLY
============================== */

const gracefulShutdown = async (signal) => {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.log(`${signal} received. Closing REMS server...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");

      try {
        if (pool) {
          await pool.end();
          console.log("Database pool closed.");
        }
      } catch (error) {
        console.error("Error closing database pool:", error.message);
      }

      process.exit(0);
    });
  } else {
    try {
      if (pool) {
        await pool.end();
      }
    } catch (error) {
      console.error("Error closing database pool:", error.message);
    }

    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

/* ==============================
   EXPORT APP FOR VERCEL
============================== */

module.exports = app;