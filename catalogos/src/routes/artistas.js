
const express = require("express");
const router = express.Router();

// Sample data for testing
let artistas = [
  { id: 1, title: "The Beatles" },
  { id: 2, title: "Led Zeppelin" },
  { id: 3, title: "Pink Floyd" }
];

// GET all artistas
router.get("/", (req, res) => {
  try {
    res.json(artistas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET artista by ID
router.get("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const artista = artistas.find(a => a.id === id);
    
    if (!artista) {
      return res.status(404).json({ error: "Artista not found" });
    }
    
    res.json(artista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new artista
router.post("/", (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const newArtista = {
      id: Math.max(...artistas.map(a => a.id), 0) + 1,
      title
    };
    
    artistas.push(newArtista);
    res.status(201).json(newArtista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update artista
router.put("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title } = req.body;
    
    const artistaIndex = artistas.findIndex(a => a.id === id);
    
    if (artistaIndex === -1) {
      return res.status(404).json({ error: "Artista not found" });
    }
    
    if (title) {
      artistas[artistaIndex].title = title;
    }
    
    res.json(artistas[artistaIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE artista
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const artistaIndex = artistas.findIndex(a => a.id === id);
    
    if (artistaIndex === -1) {
      return res.status(404).json({ error: "Artista not found" });
    }
    
    const deletedArtista = artistas.splice(artistaIndex, 1)[0];
    res.json({ message: "Artista deleted successfully", artista: deletedArtista });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
