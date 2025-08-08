
const express = require("express");
const router = express.Router();

// Sample data for testing
let albumes = [
  { id: 1, title: "Abbey Road", artistid: "1" },
  { id: 2, title: "Led Zeppelin IV", artistid: "2" },
  { id: 3, title: "The Dark Side of the Moon", artistid: "3" }
];

// GET all albumes
router.get("/", (req, res) => {
  try {
    res.json(albumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET album by ID
router.get("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const album = albumes.find(a => a.id === id);
    
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }
    
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new album
router.post("/", (req, res) => {
  try {
    const { title, artistid } = req.body;
    
    if (!title || !artistid) {
      return res.status(400).json({ error: "Title and artistid are required" });
    }
    
    const newAlbum = {
      id: Math.max(...albumes.map(a => a.id), 0) + 1,
      title,
      artistid
    };
    
    albumes.push(newAlbum);
    res.status(201).json(newAlbum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update album
router.put("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, artistid } = req.body;
    
    const albumIndex = albumes.findIndex(a => a.id === id);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: "Album not found" });
    }
    
    if (title) albumes[albumIndex].title = title;
    if (artistid) albumes[albumIndex].artistid = artistid;
    
    res.json(albumes[albumIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE album
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const albumIndex = albumes.findIndex(a => a.id === id);
    
    if (albumIndex === -1) {
      return res.status(404).json({ error: "Album not found" });
    }
    
    const deletedAlbum = albumes.splice(albumIndex, 1)[0];
    res.json({ message: "Album deleted successfully", album: deletedAlbum });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
