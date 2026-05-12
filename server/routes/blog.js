const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');

// GET all blog posts (Public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM blog_posts ORDER BY published_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single blog post by ID or Slug (Public)
router.get('/:id', async (req, res) => {
  try {
    // Check if id is UUID or slug
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.id);
    
    let query = 'SELECT * FROM blog_posts WHERE ';
    let params = [req.params.id];
    
    if (isUUID) {
      query += 'id = $1';
    } else {
      query += 'slug = $1';
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new blog post (Protected)
router.post('/', verifyToken, async (req, res) => {
  const { title, slug, excerpt, content, image, author, category } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO blog_posts (title, slug, excerpt, content, image, author, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, slug, excerpt, content, image, author, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update blog post (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  const { title, slug, excerpt, content, image, author, category } = req.body;

  try {
    const result = await db.query(
      'UPDATE blog_posts SET title = $1, slug = $2, excerpt = $3, content = $4, image = $5, author = $6, category = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [title, slug, excerpt, content, image, author, category, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE blog post (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM blog_posts WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
       return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
