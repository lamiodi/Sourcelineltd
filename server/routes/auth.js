const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');

// --- SEED ROUTE (DISABLED FOR SECURITY) ---
// To use: Uncomment, restart server, run once, then re-comment immediately.
/*
router.post('/seed-admin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, 'admin']
    );

    res.json({ message: 'Admin created successfully', user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
*/

// LOGIN ROUTE
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // 1. Get user from Postgres
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = result.rows[0];

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // 3. Create JWT
      const payload = {
        id: user.id,
        username: user.username,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.json({ token, user: { id: user.id, username: user.username } });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
