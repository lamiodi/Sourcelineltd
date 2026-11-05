const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');
const multer = require('multer');

// Use memory storage instead of Cloudinary so image uploads work locally without Cloudinary credentials
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper: store uploaded image locally in client/public/images/uploads (fallback to data URI if read-only)
function resolveUploadedImage(file, bodyImage) {
  if (!file) {
    return bodyImage || '';
  }

  try {
    const uploadsDir = path.join(__dirname, '../../client/public/images/uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname || 'project', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${base}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `/images/uploads/${filename}`;
  } catch (err) {
    console.warn('[Projects] Local disk write fallback to base64:', err.message);
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
}

// GET all projects (Public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY id ASC');
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
  const { title, category, location, description, details } = req.body;
  const image = resolveUploadedImage(req.file, req.body.image);

  try {
    const result = await db.query(
      'INSERT INTO projects (title, category, location, image, description, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, category, location, image, description, details || description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update project (Protected)
router.put('/:id', verifyToken, upload.single('imageFile'), async (req, res) => {
  const { title, category, location, description, details } = req.body;

  try {
    const existingRes = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const existing = existingRes.rows[0];
    const image = req.file
      ? resolveUploadedImage(req.file, req.body.image)
      : (req.body.image !== undefined && req.body.image !== '' ? req.body.image : existing.image);

    const result = await db.query(
      'UPDATE projects SET title = $1, category = $2, location = $3, image = $4, description = $5, details = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [
        title ?? existing.title,
        category ?? existing.category,
        location ?? existing.location,
        image,
        description ?? existing.description,
        details !== undefined ? details : existing.details,
        req.params.id
      ]
    );

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
