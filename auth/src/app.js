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

    try {
        const employee = await findEmployeeByEmail(email);

        const token = "12345"
        const key = `employee_${employee.id}`
        const values = {
            id: employee.id,
            email: employee.Email,
            role: employee.Role,
            type: "register",
            token: token
        }

        const redisClient = new RedisClient();
        await redisClient.connect();

        await redisClient.hset(key, values);
        await redisClient.disconnect();

        const messageSender = new MessageSender(QUEUE_MAIL);
        await messageSender.initialize();
        const mail = {
            to: email,
            subject: "Welcome to our platform",
            body: "Thank you for registering, Token: " + token
        };
        await messageSender.sendMessage(mail);


        const jwtToken = jwt.sign(employee, process.env.JWT_SECREAT_KEY, {
            expiresIn: "2h",
        });

        res.json({ token: jwtToken });
    } catch (err) {

        if (err.code === 5) {
            res.status(404).json({ error: "Employee not found 🤷‍♀️" });
        }else
            res.status(500).json({ error: err });
    }
})

app.post('/verify', passport.authenticate("jwt", { session: false }), async(req, res) => {

    const key = `employee_${req.user.id}`
    const redisClient = new RedisClient();
    await redisClient.connect();
    const token = await redisClient.hget(key, 'token');
    if (token !== req.body.token) {
        res.status(401).json({ message: "Invalid token" });
        return
    }

    await redisClient.disconnect();
    res.json({ message: "Token verified" });
})
