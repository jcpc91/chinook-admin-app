const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const passport = require("passport");

require("dotenv").config();



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

module.exports = passport;
