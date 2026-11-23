const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const { connectDB } = require("../../config/db");
const { BookService } = require("../../models/Book");
const apiRoutes = require("../../routes/api");

const app = express();

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: "25kb" }));
app.use(express.urlencoded({ extended: true, limit: "25kb" }));

// Ensure DB is connected and seeded on invocation
let dbInitialized = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!dbInitialized) {
      await BookService.seedInitialData();
      dbInitialized = true;
    }
  } catch (err) {
    console.error("[Netlify Function] DB initialization error:", err);
  }
  next();
});

// Mount API routes across possible Netlify rewrite prefixes
app.use("/api", apiRoutes);
app.use("/.netlify/functions/api", apiRoutes);
app.use("/", apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Netlify Function Error]", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error occurred.",
  });
});

module.exports.handler = serverless(app);
