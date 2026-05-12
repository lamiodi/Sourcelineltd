
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const db = require('../db');
require('dotenv').config();

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST subscribe to newsletter
router.post(
  '/subscribe',
  [
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // 1. Check if already subscribed
      const existing = await db.query('SELECT * FROM subscribers WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'This email is already subscribed.' });
      }

      // 2. Save to Database
      const result = await db.query(
        'INSERT INTO subscribers (email) VALUES ($1) RETURNING *',
        [email]
      );
      const savedSubscriber = result.rows[0];

      // 3. Send Welcome Email (if configured)
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your-email@gmail.com') {
        const mailOptionsUser = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Welcome to Sourceline Newsletter',
          text: `Thank you for subscribing to the Sourceline Limited newsletter.\n\nWe will keep you updated with the latest news and insights on land surveying and property development.\n\nBest regards,\nSourceline Team`
        };

        transporter.sendMail(mailOptionsUser, (err, info) => {
          if (err) console.error('Error sending welcome email:', err);
          else console.log('Welcome email sent:', info.response);
        });
      }

      res.status(201).json({ message: 'Subscribed successfully!', data: savedSubscriber });
    } catch (err) {
      console.error('Subscription error:', err);
      res.status(500).json({ message: 'An error occurred while subscribing.' });
    }
  }
);

module.exports = router;
