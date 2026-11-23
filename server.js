require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { BookService } = require("./models/Book");
const api = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: "25kb" }));
app.use(express.urlencoded({ extended: true, limit: "25kb" }));

// Static Assets
app.use(express.static(path.join(__dirname, "public")));

// RESTful API Mounting
app.use("/api", api);

// Malformed JSON handler -> clean 400 instead of exposing stack trace
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body.",
    });
  }
  next(err);
});

// Unknown API routes handler
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Unknown API endpoint: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error occurred.",
  });
});

// Server Initialization
const startServer = async () => {
  await connectDB();
  await BookService.seedInitialData();

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`   PUSTAK BOOKSTORE — ONLINE STORE SERVER             `);
      console.log(`   Running on: http://localhost:${PORT}               `);
      console.log(`=======================================================`);
    });
  }
};

startServer();

module.exports = app;
