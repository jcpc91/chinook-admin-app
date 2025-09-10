const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");
const TipoActivosService = require('../../../share/repositories/service/TipoActivosService.js')
const TipoActivosRepository = require('../../../share/repositories/inMemory/tiposactivos.repository.js')

const service = new TipoActivosService(new TipoActivosRepository())

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    service.get()
    .then(data => res.json(data))
    .catch(err => res.status(500).json(err))

});

router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    service.add(req.body)
    .then(data => res.json(data))
    .catch(err => res.status(500).json(err))
})

router.put("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    service.update(req.body)
    .then(data => res.json(data))
    .catch(err => res.status(500).json(err))
})
module.exports = router
