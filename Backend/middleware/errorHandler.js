const errorHandler = (err, req, res, next) => {
  console.error("❌ ERROR:", err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  /* ==============================
     POSTGRESQL ERRORS
  ============================== */

  if (err.code === "23505") {
    statusCode = 400;
    message = "Duplicate value already exists";
  }

  if (err.code === "23503") {
    statusCode = 400;
    message = "Invalid reference: related data not found";
  }

  if (err.code === "22P02") {
    statusCode = 400;
    message = "Invalid input syntax";
  }

  /* ==============================
     JWT ERRORS
  ============================== */

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  /* ==============================
     VALIDATION ERRORS
  ============================== */

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  /* ==============================
     RESPONSE
  ============================== */

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err
    })
  });
};

module.exports = errorHandler;