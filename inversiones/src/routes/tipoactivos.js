const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");

const tiposactivos = []
router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    res.json(tiposactivos)
});

router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    tiposactivos.push(req.body)
    res.status(201).json(req.body)
})

router.put("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    const index = tiposactivos.findIndex((i) => i.codigo == req.body.codigo)
    if (index !== -1)
        tiposactivos[index] = req.body
    res.status(200).json(req.body)
})
module.exports = router