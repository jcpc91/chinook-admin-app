const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const ValidUserRepository = require("../../database/repository/sqliteRepository/ValidUserRepository");
const ValidUserService = require('../../database/repository/service/ValidUserService')

const app = express();

require("dotenv").config();
console.log("env: ", process.env);
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN.split(',')
const validuser = new ValidUserService(new ValidUserRepository());

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

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
app.get("/", (req, res) => {
    res.send("hola mundo auth");
});
// Login route
app.post("/", async (req, res) => {
    const { username, password } = req.body;
    const user =await validuser.validUserPassword(username, password);
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
});
//handler error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
