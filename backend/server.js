const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const connectDB = require("./src/config/database");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const foodItemRoutes = require("./src/routes/foodItemRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const reservationRoutes = require("./src/routes/reservationRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");

const app = express();

// Connect to database
connectDB();

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Prevent conditional responses (304) for API calls.
// This avoids "blank" pages when the frontend expects response bodies.
app.disable("etag");
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  next();
});

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Static file serving for uploads (before security middleware)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security middleware (after static files)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5000", "http://localhost:5173"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "production" ? 1000 : 10000, // limit each IP to 1000 requests in prod, 10000 in dev
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/food-items", foodItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/settings", settingsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Eat Express API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
