const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");


const ValidUserRepository = require("../../database/repository/sqliteRepository/ValidUserRepository");
const ValidUserService = require('../../database/repository/service/ValidUserService')
const {findEmployeeByEmail} = require('../../share/proto_client_services/employee_client')
const {QUEUE_MAIL} = require('../../share/sqs-config')
const MessageSender = require('../../share/message-sender')

const app = express();

require("dotenv").config();

const port = process.env.PORT || 3000;
process.env.EVENT_BUS_TYPE = 'elasticmq';
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
// const registerRoute = require("./routes/register");
// app.use("/", registerRoute);

app.post("/", async (req, res) => {
    const { username, password } = req.body;
    const user =await validuser.validUserPassword(username, password);

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



app.post("/register", async (req, res) => {
    const { email } = req.body;
    try {
        const employee = await findEmployeeByEmail(email);
        const messageSender = new MessageSender(QUEUE_MAIL);
        await messageSender.initialize();
        const mail = {
            to: employee.Email,
            subject: "Welcome to our platform",
            body: "Thank you for registering"
        };
        await messageSender.sendMessage(mail);
        const token = jwt.sign(employee, process.env.JWT_SECREAT_KEY, {
            expiresIn: "2h",
        });
        res.json({ token });
    } catch (err) {
        res.status(404).json({ error: err });
    }
})
