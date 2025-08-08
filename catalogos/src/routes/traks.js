const express = require("express");
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");
const TrakService = require("../../../database/repository/service/TraksService.js");
const TrakRepository = require("../../../database/repository/sqliteRepository/TrackRepository.js");

const router = express.Router();
const repository = new TrakService(new TrakRepository());

router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    if (req.query.albumid) {
        repository
            .getTrakByIdAlbum(req.query.albumid)
            .then((traks) => {
                res.json(traks);
            })
            .catch((error) => {
                res.status(500).json({ error: error });
            });
    } else {
        repository
            .getTraks()
            .then((traks) => {
                res.json(traks);
            })
            .catch((error) => {
                res.status(500).json({ error: error });
            });
    }
});

router.get("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    repository
        .getTrakById(parseInt(req.params.id))
        .then((trak) => {
            res.json(trak);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});
router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    console.log(req.body);
    repository
        .createTrak(req.body)
        .then((trak) => {
            res.json(trak);
        })
        .catch((error) => {
            res.status(500).json({ error: error });
        });
});
router.put("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
    repository
        .updateTrak(req.body)
        .then((trak) => {
            res.json(trak);
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});
module.exports = router;
