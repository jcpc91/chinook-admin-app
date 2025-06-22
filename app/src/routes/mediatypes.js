const express = require('express');
const router = express.Router();

// GET all media types
router.get('/', (req, res) => {
  // Implementation for getting all media types
  res.send('GET all media types');
});

// POST a new media type
router.post('/', (req, res) => {
  // Implementation for creating a new media type
  res.send('POST a new media type');
});

// PUT (update) a media type
router.put('/:id', (req, res) => {
  // Implementation for updating a media type
  res.send(`PUT media type with id ${req.params.id}`);
});

// DELETE a media type
router.delete('/:id', (req, res) => {
  // Implementation for deleting a media type
  res.send(`DELETE media type with id ${req.params.id}`);
});

module.exports = router;
