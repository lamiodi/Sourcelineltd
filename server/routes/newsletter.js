const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Handler for subscribing to newsletter
const handleSubscribe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // 1. Check if already subscribed
    try {
      const existing = await db.query('SELECT * FROM subscribers WHERE email = $1', [email]);
      if (existing.rows && existing.rows.length > 0) {
        return res.status(409).json({ message: 'This email is already subscribed to our newsletter.' });
      }
    } catch (checkErr) {
      console.warn('[Newsletter] DB check warning:', checkErr.message);
    }

    // 2. Save to Database
    let savedSubscriber = { email, subscribed_at: new Date().toISOString(), is_active: true };
    try {
      const result = await db.query(
        'INSERT INTO subscribers (email) VALUES ($1) RETURNING *',
        [email]
      );
      if (result.rows && result.rows.length > 0) {
        savedSubscriber = result.rows[0];
      }
    } catch (insertErr) {
      console.warn('[Newsletter] DB insert warning:', insertErr.message);
    }

    // 3. Send Welcome Email via Resend
    if (process.env.RESEND_API_KEY) {
      const sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      resend.emails.send({
        from: `Sourceline Insights <${sender}>`,
        to: [email],
        subject: 'Welcome to the Sourceline Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; color: #000440; line-height: 1.6;">
            <div style="background-color: #000440; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0;">Sourceline Limited</h2>
              <p style="color: #FF6806; margin: 6px 0 0 0; font-size: 14px;">Geospatial Insights & Land Advisory</p>
            </div>
            <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <h3 style="color: #000440; margin-top: 0;">Welcome to our community!</h3>
              <p>Thank you for subscribing to the Sourceline newsletter.</p>
              <p>You'll now receive timely updates on land surveying laws, Lagos State excision policies, spatial planning, GPS datum conversions, and property fraud prevention.</p>
              <p>Need immediate surveying consultations? Visit <a href="https://www.sourcelineltd.com" style="color: #FF6806; font-weight: bold;">sourcelineltd.com</a> or call our Sangotedo office at +234 803 461 8227.</p>
            </div>
          </div>
        `
      }).catch(e => console.error('[Newsletter] Resend welcome error:', e.message));
    }

    res.status(201).json({ message: 'Subscribed successfully!', data: savedSubscriber });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ message: 'An error occurred while subscribing.' });
  }
};

const validateEmail = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
];

// Support both POST / and POST /subscribe
router.post('/', validateEmail, handleSubscribe);
router.post('/subscribe', validateEmail, handleSubscribe);

// GET all subscribers (Protected - Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
    res.json(result.rows || []);
  } catch (err) {
    console.error('[Newsletter] Error fetching subscribers:', err.message);
    res.status(500).json({ message: 'Error retrieving subscribers', error: err.message });
  }
});

// DELETE a subscriber (Protected - Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM subscribers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Subscriber removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

