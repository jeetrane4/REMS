require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

/* ==============================
   START SERVER
============================== */

const server = app.listen(PORT, () => {
  console.log(`REMS Server running on port ${PORT}`);
});

/* ==============================
   HANDLE UNCAUGHT EXCEPTIONS
============================== */

process.on("uncaughtException",(err)=>{
  console.error("Uncaught Exception:",err);
  process.exit(1);
});

/* ==============================
   HANDLE PROMISE REJECTIONS
============================== */

process.on("unhandledRejection",(err)=>{
  console.error("Unhandled Promise Rejection:",err);

  server.close(()=>{
    process.exit(1);
  });
});

/* ==============================
   GRACEFUL SHUTDOWN
============================== */

process.on("SIGTERM",()=>{
  console.log("SIGTERM received. Closing server...");

  server.close(()=>{
    console.log("Server closed.");
  });
});