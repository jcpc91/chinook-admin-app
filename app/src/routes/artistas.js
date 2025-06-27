const express = require("express");
const router = express.Router();
const passport = require("passport");
const ArtistService = require("../../repositories/service/ArtistService.js");
const JsonFileArtistRepository = require("../../repositories/jsonRepository/artistas.js");

const repository = new ArtistService(new JsonFileArtistRepository());
// GET all artists
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        repository
            .getArtists()
            .then((artistas) => {
                res.json(artistas);
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    },
);

// get artist by id
router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        repository.getArtistById(parseInt(req.params.id)).then((artist) => {
            res.json(artist);
        });
    },
);

// POST a new artist
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // Implementation for creating a new artist
        repository
            .createArtist(req.body)
            .then((artist) => {
                res.json(artist);
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    },
);

// PUT (update) an artist
router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        repository
            .updateArtist(parseInt(req.params.id), req.body)
            .then((artist) => {
                res.json(artist);
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    },
);

module.exports = router;
