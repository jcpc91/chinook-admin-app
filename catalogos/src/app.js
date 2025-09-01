const express = require("express");
const cors = require("cors");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_TYPE = process.env.DB_TYPE || 'sqlite3';

console.log(`🚀 Starting Catalogos service in ${NODE_ENV} mode with ${DB_TYPE} database`);

// Test database connection on startup for PostgreSQL
if (DB_TYPE === 'postgresql') {
  const knex = require('knex');
  const knexConfig = require('../../database/catalogos/knexfile.js');

  const db = knex(knexConfig[NODE_ENV]);

  db.raw('SELECT 1')
    .then(() => {
      console.log('✅ PostgreSQL database connection successful');
    })
    .catch((err) => {
      console.error('❌ PostgreSQL database connection failed:', err.message);
      console.error('Database configuration:', {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: process.env.DB_PORT
      });
      // Don't exit in container environment, let health checks handle it
      if (NODE_ENV !== 'development') {
        console.log('⚠️  Service will continue but may not function properly');
      }
    })
    .finally(() => {
      db.destroy();
    });
}

// JWT Strategy configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECREAT_KEY,
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    // In a real application, you would:
    // 1. Look up the user by the ID (or other unique identifier) in the jwtPayload from your database.
    // 2. If the user is found, return done(null, user).
    // 3. If the user is not found, return done(null, false).
    // For this example, we'll assume the token is valid if it contains a user property.
    if (jwtPayload.user) {
      return done(null, jwtPayload);
    } else {
      return done(null, false);
    }
  }),
);

// Initialize passport
app.use(passport.initialize());

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


// Health check endpoint with database connectivity check
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "OK",
    service: "catalogos",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: NODE_ENV,
    database: {
      status: "unknown",
      type: DB_TYPE
    }
  };

  try {
    // Test database connectivity
    const knex = require('knex');
    const path = require('path');
    const knexConfig = require(path.resolve(__dirname, '../../database/catalogos/knexfile.js'));

    const db = knex(knexConfig[NODE_ENV]);

    // Simple connectivity test
    await db.raw('SELECT 1 as test');
    healthCheck.database.status = "connected";

    // Clean up connection
    await db.destroy();
  } catch (error) {
    console.error('Health check database error:', error.message);
    healthCheck.database.status = "error";
    healthCheck.database.error = error.message;
    healthCheck.status = "DEGRADED";
  }

  // Return appropriate HTTP status based on health
  const httpStatus = healthCheck.status === "OK" ? 200 : 503;
  res.status(httpStatus).json(healthCheck);
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
app.use((err, req, res, _next) => {
  const timestamp = new Date().toISOString();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error details for debugging
  console.error(`[${timestamp}] Error in ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Handle specific error types
  let statusCode = err.status || err.statusCode || 500;
  let message = "Internal server error";

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = "Validation error";
  } else if (err.name === 'UnauthorizedError' || err.message.includes('jwt')) {
    statusCode = 401;
    message = "Authentication failed";
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = "Database connection failed";
  } else if (isDevelopment) {
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    timestamp,
    path: req.path,
    method: req.method,
    ...(isDevelopment && {
      message: err.message,
      stack: err.stack,
      details: err
    })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server with proper error handling
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Catalogos API server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database type: ${process.env.DB_TYPE || 'sqlite3'}`);
});

// Graceful shutdown handling for containers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
