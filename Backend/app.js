require("dotenv").config({ path: "./Backend/.env" });

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const savedPropertyRoutes = require("./routes/savedPropertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const propertyDocumentRoutes = require("./routes/propertyDocumentRoutes");
const userDocumentRoutes = require("./routes/userDocumentRoutes");
const otpRoutes = require("./routes/otpRoutes");
const mapRoutes = require("./routes/mapRoutes");
const comparisonRoutes = require("./routes/comparisonRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const loanRoutes = require("./routes/loanRoutes");
const contactRoutes = require("./routes/contactRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ==============================
   SECURITY
============================== */

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ==============================
   PERFORMANCE
============================== */

app.use(compression());

/* ==============================
   RATE LIMIT
============================== */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later."
  }
});

app.use("/api", limiter);

/* ==============================
   LOGGING
============================== */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ==============================
   BODY PARSER
============================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ==============================
   STATIC FILES
============================== */

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "Backend", "uploads"))
);

/* ==============================
   HEALTH CHECK
============================== */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    service: "REMS API",
    version: "1.0.0",
    time: new Date().toISOString()
  });
});

/* ==============================
   ROOT
============================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "REMS API running successfully",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api"
    }
  });
});

/* ==============================
   API ROUTES
============================== */

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/saved-properties", savedPropertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/property-images", imageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/property-documents", propertyDocumentRoutes);
app.use("/api/user-documents", userDocumentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/comparisons", comparisonRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/contact", contactRoutes);

/* ==============================
   404 HANDLER
============================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

/* ==============================
   ERROR HANDLER
============================== */

app.use(errorHandler);

module.exports = app;