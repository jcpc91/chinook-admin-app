const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../middelware/rolles.js");
const GenerosService = require("../../repositories/service/GenerosService.js");
const GenreRepository = require("../../repositories/sqliteRepository/GenreRepository.js");

const repository = new GenerosService(new GenreRepository());
// GET all genres
router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    repository
        .getGeneros()
        .then((generos) => {
            res.json(generos);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    // Implementation for creating a new genre
    repository
        .createGenero(req.body)
        .then((genre) => {
            res.json(genre);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

router.put("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    repository
        .updateGenero(parseInt(req.params.id), req.body)
        .then((genre) => {
            res.json(genre);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

module.exports = router;
