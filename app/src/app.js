const express = require("express");
const cors = require("cors");
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const chance = require('chance').Chance();

require("dotenv").config();
const PROTO_PATH = '../share/proto/employee.proto';

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const employee_proto = grpc.loadPackageDefinition(packageDefinition).employee;

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

function FindEmployeeByEmail(call, callback) {
  // Simulate a database lookup
  const employee = {
        "EmployeeId": chance.integer({ min: 1, max: 100 }),
        "LastName": chance.last(),
        "FirstName": chance.first(),
        "Title": chance.pickone(['Manager', 'Sales Representative', 'Engineer']),
        "ReportsTo": chance.integer({ min: 1, max: 10 }),
        "BirthDate": chance.date({ year: chance.year({ min: 1950, max: 2000 }) }).toISOString(),
        "HireDate": chance.date({ year: chance.year({ min: 2000, max: 2023 }) }).toISOString(),
        "Address": chance.address(),
        "City": chance.city(),
        "State": chance.state(),
        "Country": chance.country(),
        "PostalCode": chance.postcode(),
        "Phone": chance.phone(),
        "Fax": chance.phone(),
        "Email": chance.email(),
        "Role": chance.pickone(['Admin', 'User', 'Guest']),
    }

    if (employee) {
        callback(null, employee);
    }
    else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Employee not found"
        });
    }
}

const app = express();

const passport = require("passport");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

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

const employeesRouter = require("./routes/employee");
const customersRouter = require("./routes/customers");
app.use("/employees", employeesRouter);
app.use("/customers", customersRouter);
//error handler
app.use((err, req, res, _next) => {
  console.error(err);

  res.status(500).send(err);
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    const server = new grpc.Server();
    server.addService(employee_proto.EmployeeService.service, {FindEmployeeByEmail: FindEmployeeByEmail});
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
        console.error(err);
        return;
        }
        server.start();
        console.log('Servidor gRPC iniciado en el puerto', port);
    });
});

module.exports = app;
