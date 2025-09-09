const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");
const ActivosService = require("../../../share/repositories/service/ActivosService");
const ActivosRepository = require("../../../share/repositories/inMemory/activos.repository");

const repository = new ActivosService(new ActivosRepository());

const AVJ = require('ajv')
const ajv = new AVJ()
const activosSchema = require("../../../share/schemas/activos.schema.js")
const validate = ajv.compile(activosSchema)

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (_req, res) => {
    repository.getAll().then((activos) => {
        res.json(activos);
    });
});


router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    const valid = validate(req.body)
    if (!valid) {
        return res.status(400).json(validate.errors)
    }
    repository.add(req.body).then((activo) => {
        res.json(activo);
    });
});

router.put("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    const valid = validate(req.body)
    if (!valid) {
        return res.status(400).json(validate.errors)
    }
    repository.update(req.params.id, req.body).then((activo) => {
        res.json(activo);
    });
});

router.delete("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    repository.delete(req.params.id).then((activo) => {
        res.json(activo);
    });
});

module.exports = router;
