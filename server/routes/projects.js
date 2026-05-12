const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');

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
router.post('/', verifyToken, async (req, res) => {
  const { title, category, location, image, description } = req.body;

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
router.put('/:id', verifyToken, async (req, res) => {
  const { title, category, location, image, description } = req.body;

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
