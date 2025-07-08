const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const simulateLongIOProcess = require("./simulateLongCPUProcess");
require("dotenv").config();
console.log("env: ", process.env);
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Enable Express to parse JSON request bodies
app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
app.get("/", (req, res) => {
  res.send("hola mundo auth");
});
// Login route
app.post("/", async (req, res) => {
  const { username, password } = req.body;
  //await simulateLongIOProcess(5000);
  // Validate credentials
  if (username === "admin" && password === "admin") {
    // Generate JWT token
    const token = jwt.sign({ user: "admin" }, process.env.JWT_SECREAT_KEY, {
      expiresIn: "2h",
    });
    res.json({ token });
  } else {
    // Invalid credentials
    res.status(401).json({ message: "Invalid credentials" });
  }
});
