const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = ['../share/proto/helloworld.proto', '../share/proto/employee.proto'];
const ValidUserRepository = require("../../database/repository/sqliteRepository/ValidUserRepository");
const ValidUserService = require('../../database/repository/service/ValidUserService')

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const helloworld_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;
const employee_proto = grpc.loadPackageDefinition(packageDefinition).employee;

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
const registerRoute = require("./routes/register");
app.use("/", registerRoute);

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

app.post("/sayhi", async (req, res) => {
    const { email } = req.body;
    const client = new helloworld_proto.Greeter('localhost:50051',  grpc.credentials.createInsecure());
    client.sayHello({name: email}, function(err, response) {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ message: 'Error in gRPC call' });
        }

        res.json(response);
    }
    );
})

app.post("/register", async (req, res) => {
    const { email } = req.body;
    const client = new employee_proto.EmployeeService('localhost:50052', grpc.credentials.createInsecure());
    client.FindEmployeeByEmail({email: email}, function(err, response) {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ message: 'Error in gRPC call' });
        }
        const token = jwt.sign(response, process.env.JWT_SECREAT_KEY, {
            expiresIn: "2h",
        });
        res.json(token);
    });
})
