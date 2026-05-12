const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sourceline/projects',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// GET all projects (Public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single project (Public)
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new project (Protected)
router.post('/', verifyToken, upload.single('imageFile'), async (req, res) => {
  const { title, category, location, description } = req.body;
  // If a file was uploaded, use its path (Cloudinary URL). Otherwise, check if an existing image URL was passed.
  const image = req.file ? req.file.path : req.body.image;

  try {
    const result = await db.query(
      'INSERT INTO projects (title, category, location, image, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, category, location, image, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update project (Protected)
router.put('/:id', verifyToken, upload.single('imageFile'), async (req, res) => {
  const { title, category, location, description } = req.body;
  const image = req.file ? req.file.path : req.body.image;

  try {
    const result = await db.query(
      'UPDATE projects SET title = $1, category = $2, location = $3, image = $4, description = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [title, category, location, image, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE project (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
