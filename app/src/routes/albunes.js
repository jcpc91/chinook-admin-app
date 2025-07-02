const express = require("express");
const router = express.Router();
const passport = require("passport");
const AlbumService = require("../../repositories/service/AlbumService.js");
const JsonFileAlbumRepository = require("../../repositories/jsonRepository/albums.js");

const repository = new AlbumService(new JsonFileAlbumRepository());

//get albunes by artistid route get /albunes?artistid=1
router.get("/", 
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
    const artistId = req.query.artistid;
    if (artistId) {
        repository
            .getAlbumByArtistId(artistId)
            .then((albunes) => {
                res.json(albunes || []);
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    } else {
        res.status(404).json();
    }
});

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        repository
            .createAlbum(req.body)
            .then((album) => {
                res.json(album);
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    },
);

// put albunes/:id
router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) =>{
        repository
            .updateAlbum(parseInt(req.params.id), req.body)
            .then((album) => {
                res.json(album);
            })
            .catch((error) => {
                res.status(500).json({ error: error.message });
            });
    })

module.exports = router;
