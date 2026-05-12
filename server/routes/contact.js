const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');
require('dotenv').config();

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST submit contact form (Public)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').optional().trim().escape(),
    body('message').trim().notEmpty().withMessage('Message is required').escape(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, message } = req.body;

    try {
      // 1. Save to Database
      const result = await db.query(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, phone, message]
      );
      const savedContact = result.rows[0];

    // 2. Send Email Notification to Admin
    const mailOptionsAdmin = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self/admin
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `
    };

    // 3. Send Acknowledgment to User
    const mailOptionsUser = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Sourceline Limited',
      text: `Dear ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\nSourceline Team`
    };

    // Send emails (don't block response if email fails, but log it)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter.sendMail(mailOptionsAdmin, (err, info) => {
        if (err) console.error('Error sending admin email:', err);
        else console.log('Admin email sent:', info.response);
        });

        transporter.sendMail(mailOptionsUser, (err, info) => {
        if (err) console.error('Error sending user email:', err);
        else console.log('User email sent:', info.response);
        });
    }

    res.status(201).json({ message: 'Message sent successfully!', data: savedContact });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all contacts (Protected - Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
