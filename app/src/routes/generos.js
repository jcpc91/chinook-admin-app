const express = require('express');
const router = express.Router();
const GenerosService = require('../../repositories/service/GenerosService.js');
const JsonFileGenreRepository = require('../../repositories/jsonRepository/generos.js');

const repository = new GenerosService( new JsonFileGenreRepository())
// GET all genres
router.get('/', (req, res) => {
    repository.getGeneros().then(generos => {
        res.json(generos);
    })
    .catch(error => {
        res.status(500).json({ error: error.message });
    });
});

router.post('/', (req, res) => {
    // Implementation for creating a new genre
    repository.createGenero(req.body)
    .then(genre => {
        res.json(genre);
    }).catch(error => {
        res.status(500).json({ error: error.message });
    })
})

router.put('/:id', (req, res) => {
    repository.updateGenero(parseInt(req.params.id), req.body)
    .then(genre => {
        res.json(genre);
    }).catch(error => {
        res.status(500).json({ error: error.message });
    })
})

module.exports = router;