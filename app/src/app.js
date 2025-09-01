const express = require("express");
const cors = require("cors");
const app = express();

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

require("dotenv").config();
console.log("env: ", process.env.CORS_ORIGIN || "http://localhost:3000");
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

// Health check endpoint with database connectivity check
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "OK",
    service: "chinook-app",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: "unknown",
      type: process.env.DB_TYPE || "sqlite3"
    }
  };

  try {
    // Test database connectivity
    const knex = require('knex');
    const path = require('path');
    const environment = process.env.NODE_ENV || 'development';
    const knexConfig = require(path.resolve(__dirname, '../../database/app/knexfile.js'));

    const db = knex(knexConfig[environment]);

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

const jwtSecret = process.env.JWT_SECREAT_KEY;
const jwtOptions = {
  // Tells the strategy how to extract the JWT from the request
  // We expect it in the Authorization header as a Bearer token
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // The secret or key to verify the token's signature
  secretOrKey: jwtSecret,
  // If you want to allow tokens signed with 'none' algorithm (NOT RECOMMENDED for production)
  // ignoreExpiration: false, // Default is false, checks token expiration
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    // In a real application, you would:
    // 1. Look up the user by the ID (or other unique identifier) in the jwtPayload from your database.
    // 2. Check if the user exists and is authorized.
    // For this example, we'll just log the payload and assume authentication is successful
    // if the token is valid (signed with the correct secret).

    console.log("JWT Payload received:", jwtPayload);

    // Example: If a 'userId' existed in the payload and you wanted to find the user:
    // User.findById(jwtPayload.userId, (err, user) => {
    //   if (err) { return done(err, false); }
    //   if (user) { return done(null, user); }
    //   return done(null, false);
    // });
    // For this simple example, we'll just return a placeholder user if the token is valid.
    // The 'user' object returned here (e.g., { id: jwtPayload.sub || 'testUser' })
    // will be attached to req.user in the route handler if authentication succeeds.
    if (jwtPayload) {
      // Return null for error, and the user object (or true if no specific user object needed)
      return done(null, jwtPayload);
    } else {
      // Return null for error, and false if no user could be found/authenticated
      return done(null, false);
    }
  }),
);

// This middleware initializes Passport within the Express application.
app.use(passport.initialize());

// Import routes
//const mediaTypesRouter = require("./routes/mediatypes");
//const generosRouter = require("./routes/generos");
//const artistasRouter = require("./routes/artistas");
//const albunesRouter = require("./routes/albunes");
//const traksRouter = require("./routes/traks");
const employeesRouter = require("./routes/employee");
const customersRouter = require("./routes/customers");
// Use routes
//app.use("/mediatypes", mediaTypesRouter);
//app.use("/generos", generosRouter);
//app.use("/artistas", artistasRouter);
//app.use("/albunes", albunesRouter);
//app.use("/traks", traksRouter);
app.use("/employees", employeesRouter);
app.use("/customers", customersRouter);
//error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).send(err);
});
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown handling for containerized environments
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }

    console.log('Server closed successfully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle container shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
