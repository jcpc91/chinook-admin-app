const express = require("express");
const cors = require("cors");
const app = express();

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const OAuth2Strategy = require("passport-oauth2").Strategy
const BearerStrategy = require("passport-http-bearer").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

require("dotenv").config();
console.log("env: ", process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

const jwtSecret = "supersecretjwtkeythatshouldbemorecomplexandfromenv";
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
      return done(null, {
        id: jwtPayload.sub || "testUser",
        message: "User authenticated via JWT",
      });
    } else {
      // Return null for error, and false if no user could be found/authenticated
      return done(null, false);
    }
  }),
);
passport.use(new OAuth2Strategy({
  authorizationURL: 'http://localhost:3001/authorize',
  tokenURL: 'http://localhost:3001/token',
  clientID: 'doeclient',
  clientSecret: 'foobarbaz'  
}, function(accessToken, refreshToken, profile, done) {
  console.log(accessToken, refreshToken, profile, done)
  return done(null, profile);
}))
passport.use(new BearerStrategy(function(token, done) {
  console.log(token)
  return done(null, token);
}))
// This middleware initializes Passport within the Express application.
app.use(passport.initialize());

// Import routes
const mediaTypesRouter = require("./routes/mediatypes");
const generosRouter = require("./routes/generos");
const artistasRouter = require("./routes/artistas");
const albunesRouter = require("./routes/albunes");

app.get("/generate-token", (req, res) => {
  const payload = { sub: "someUserId123", username: "testuser" };
  // Sign the token with the secret and set an expiration (e.g., 1 hour)
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
  res.json({ message: "Token generated (for testing)", token: token });
});
// Use routes
app.use("/mediatypes", mediaTypesRouter);
app.use("/generos", generosRouter);
app.use("/artistas", artistasRouter);
app.use("/albunes", albunesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
