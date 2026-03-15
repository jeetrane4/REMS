require("dotenv").config();

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

const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ==============================
   SECURITY
============================== */

app.use(helmet());

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

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
  message: "Too many requests from this IP"
});

app.use("/api", limiter);

/* ==============================
   LOGGING
============================== */

app.use(morgan("dev"));

/* ==============================
   BODY PARSER
============================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==============================
   STATIC FILES
============================== */

app.use("/uploads", express.static("uploads"));

/* ==============================
   HEALTH CHECK
============================== */

app.get("/health",(req,res)=>{
  res.json({
    status:"OK",
    service:"REMS API",
    time:new Date()
  });
});

/* ==============================
   ROOT
============================== */

app.get("/",(req,res)=>{
  res.json({
    message:"REMS API running",
    version:"2.0"
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
app.use("/api/properties/compare", comparisonRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/loans", loanRoutes);

/* ==============================
   404 HANDLER
============================== */

app.use((req,res)=>{
  res.status(404).json({
    success:false,
    message:"Route not found"
  });
});

/* ==============================
   ERROR HANDLER
============================== */

app.use(errorHandler);

module.exports = app;