const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const passport = require("../../share/config-jwtStrategy");

const ValidUserRepository = require("../../database/repository/sqliteRepository/ValidUserRepository");
const ValidUserService = require('../../database/repository/service/ValidUserService')
const {findEmployeeByEmail} = require('../../share/proto_client_services/employee_client')
const {QUEUE_MAIL} = require('../../share/sqs-config')
const MessageSender = require('../../share/message-sender')
const RedisClient = require('../../share/redis-client')
const app = express();

require("dotenv").config();

const port = process.env.PORT || 3000;
process.env.EVENT_BUS_TYPE = 'elasticmq';
console.log(process.env)
const allowedOrigins = process.env.CORS_ORIGIN.split(',')
const validuser = new ValidUserService(new ValidUserRepository());

app.use(passport.initialize());
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

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {


        const redisClient = new RedisClient();
        await redisClient.connect();
        //TODO: Generate random token
        const token = "12345"
        await redisClient.set(token, email );
        await redisClient.disconnect();
        const messageSender = new MessageSender(QUEUE_MAIL);
        await messageSender.initialize();
        const mail = {
            to: email,
            subject: "Welcome to our platform",
            body: "Thank you for registering, Token: " + token
        };
        await messageSender.sendMessage(mail);

        res.send({message: "Email sent successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err });
    }
})

app.post('/verify', async(req, res) => {

    const { token } = req.body;

    const redisClient = new RedisClient();
    await redisClient.connect();
    const email = await redisClient.get(token);
    await redisClient.disconnect();
    const employee = await findEmployeeByEmail(email);
    if (employee) {
        employee.type= "verify"
        const jwtToken = jwt.sign(employee, process.env.JWT_SECREAT_KEY, {
            expiresIn: "2h",
        });



        res.json({ token: jwtToken });
    } else {
        res.status(401).json({ message: "Employee not found" });
    }
})
