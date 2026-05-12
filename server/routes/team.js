const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');

// GET all team members (Public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_members ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single team member (Public)
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM team_members WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new team member (Protected)
router.post('/', verifyToken, async (req, res) => {
  const { name, position, surcon_number, image, bio } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO team_members (name, position, surcon_number, image, bio) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, position, surcon_number, image, bio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update team member (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  const { name, position, surcon_number, image, bio } = req.body;

  try {
    const result = await db.query(
      'UPDATE team_members SET name = $1, position = $2, surcon_number = $3, image = $4, bio = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, position, surcon_number, image, bio, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE team member (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
