const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    res.json([])
});
module.exports = router