
const express = require("express");
const router = express.Router();

// Sample data for testing
let generos = [
  { id: 1, title: "Rock" },
  { id: 2, title: "Jazz" },
  { id: 3, title: "Pop" }
];

// GET all generos
router.get("/", (req, res) => {
  try {
    res.json(generos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET genero by ID
router.get("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const genero = generos.find(g => g.id === id);
    
    if (!genero) {
      return res.status(404).json({ error: "Genero not found" });
    }
    
    res.json(genero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new genero
router.post("/", (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const newGenero = {
      id: Math.max(...generos.map(g => g.id), 0) + 1,
      title
    };
    
    generos.push(newGenero);
    res.status(201).json(newGenero);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update genero
router.put("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title } = req.body;
    
    const generoIndex = generos.findIndex(g => g.id === id);
    
    if (generoIndex === -1) {
      return res.status(404).json({ error: "Genero not found" });
    }
    
    if (title) {
      generos[generoIndex].title = title;
    }
    
    res.json(generos[generoIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE genero
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const generoIndex = generos.findIndex(g => g.id === id);
    
    if (generoIndex === -1) {
      return res.status(404).json({ error: "Genero not found" });
    }
    
    const deletedGenero = generos.splice(generoIndex, 1)[0];
    res.json({ message: "Genero deleted successfully", genero: deletedGenero });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
