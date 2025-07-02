const express = require("express");
const router = express.Router();
const passport = require("passport");

const TrakService = require("../../repositories/service/TraksService.js");
const JsonFileTrakRepository = require("../../repositories/jsonRepository/traks.js");

const repository = new TrakService(new JsonFileTrakRepository());

router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    repository
        .getAll()
        .then((traks) => {
            res.json(traks);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

router.get("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    repository
        .getTrakById(parseInt(req.params.id))
        .then((trak) => {
            res.json(trak);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
})
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
    repository
        .createTrak(req.body)
        .then((trak) => {
            res.json(trak);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});
module.exports = router;