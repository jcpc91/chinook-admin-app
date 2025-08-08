
const express = require("express");
const router = express.Router();

// Sample data for testing
let mediatypes = [
  { id: 1, title: "MPEG audio file" },
  { id: 2, title: "Protected AAC audio file" },
  { id: 3, title: "Protected MPEG-4 video file" }
];

// GET all mediatypes
router.get("/", (req, res) => {
  try {
    res.json(mediatypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET mediatype by ID
router.get("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mediatype = mediatypes.find(m => m.id === id);
    
    if (!mediatype) {
      return res.status(404).json({ error: "MediaType not found" });
    }
    
    res.json(mediatype);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new mediatype
router.post("/", (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    const newMediaType = {
      id: Math.max(...mediatypes.map(m => m.id), 0) + 1,
      title
    };
    
    mediatypes.push(newMediaType);
    res.status(201).json(newMediaType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update mediatype
router.put("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title } = req.body;
    
    const mediatypeIndex = mediatypes.findIndex(m => m.id === id);
    
    if (mediatypeIndex === -1) {
      return res.status(404).json({ error: "MediaType not found" });
    }
    
    if (title) {
      mediatypes[mediatypeIndex].title = title;
    }
    
    res.json(mediatypes[mediatypeIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE mediatype
router.delete("/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mediatypeIndex = mediatypes.findIndex(m => m.id === id);
    
    if (mediatypeIndex === -1) {
      return res.status(404).json({ error: "MediaType not found" });
    }
    
    const deletedMediaType = mediatypes.splice(mediatypeIndex, 1)[0];
    res.json({ message: "MediaType deleted successfully", mediatype: deletedMediaType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
