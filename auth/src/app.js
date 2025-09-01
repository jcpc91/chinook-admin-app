const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const DatabaseFactory = require("../../database/repository/DatabaseFactory");
const ValidUserService = require('../../database/repository/service/ValidUserService')

const app = express();

require("dotenv").config();
console.log("env: ", process.env);
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN.split(',')
const validUserRepository = DatabaseFactory.createValidUserRepository();
const validuser = new ValidUserService(validUserRepository);

// Enable CORS
app.use(
    cors({
        // origin: function (origin, callback) {
        //     // Check if the requesting origin is in the allowedOrigins array
        //     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        //     // If allowed or if the origin is not present (e.g., same-origin requests or non-browser requests), allow access
        //     callback(null, true);
        //     } else {
        //     // If not allowed, send an error
        //     callback(new Error('Not allowed by CORS'));
        // }},
        origin: allowedOrigins[0],
        credentials: false,
    }),
);

// Enable Express to parse JSON request bodies
app.use(express.json());

// Health check endpoint with database connectivity check
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "OK",
    service: "auth",
    timestamp: new Date().toISOString(),
    port: port,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: "unknown",
      type: "sqlite3"
    }
  };

  try {
    // Test database connectivity
    if (validUserRepository) {
      // Try a simple database operation to verify connectivity
      await validUserRepository.testConnection();
      healthCheck.database.status = "connected";
    } else {
      healthCheck.database.status = "not_initialized";
    }
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

const server = app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('HTTP server closed');
        if (validUserRepository && typeof validUserRepository.close === 'function') {
            validUserRepository.close().then(() => {
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('HTTP server closed');
        if (validUserRepository && typeof validUserRepository.close === 'function') {
            validUserRepository.close().then(() => {
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
});
app.get("/", (req, res) => {
    res.send("hola mundo auth");
});
// Login route
app.post("/", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await validuser.validUserPassword(username, password);
        console.log(user);
        if (user) {
            // Generate JWT token
            const token = jwt.sign(
                { user: user.username, role: user.role },
                process.env.JWT_SECREAT_KEY,
                {
                    expiresIn: "2h",
                },
            );

            res.json({ token });
        } else {
            // Invalid credentials
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});
