const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
console.log("env: ", process.env)
const PORT = process.env.PORT || 3002;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.get("/", (_req, res) => {
  res.json({ 
    message: "Catalogos API is running",
    version: "1.0.0"
  });
});


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Import and use route modules

const generosRoutes = require("./routes/generos");
const artistasRoutes = require("./routes/artistas");
const albumesRoutes = require("./routes/albunes");
const mediaTypesRoutes = require("./routes/mediatypes");
const traksRoutes = require("./routes/traks");

app.use("/api/generos", generosRoutes);
app.use("/api/artistas", artistasRoutes);
app.use("/api/albunes", albumesRoutes);
app.use("/api/mediatypes", mediaTypesRoutes);
app.use("/api/traks", traksRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
/*
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl 
  });
});
*/

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Catalogos API server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
