const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isAdmin } = require("../../../share/middelware/rolles.js");
const MediaTypeService = require("../../../database/repository/service/MediaTypeService.js");
const CatalogosRepositoryFactory = require("../../../database/repository/CatalogosRepositoryFactory.js");

const repository = new MediaTypeService(CatalogosRepositoryFactory.createMediaTypeRepository());

// GET all media types
router.get("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository.getMediaTypes().then((mediatypes) => {
    res.json(mediatypes);
  });
});

// POST a new media type
router.post("/", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  // Implementation for creating a new media type
  repository
    .createMediaType(req.body)
    .then((mediaType) => {
      res.json(mediaType);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// PUT (update) a media type
router.put("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  repository
    .updateMediaType(parseInt(req.params.id), req.body)
    .then((mediaType) => {
      res.json(mediaType);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

// DELETE a media type
router.delete("/:id", passport.authenticate("jwt", { session: false }), isAdmin, (req, res) => {
  // Implementation for deleting a media type
  res.send(`DELETE media type with id ${req.params.id}`);
});

module.exports = router;
