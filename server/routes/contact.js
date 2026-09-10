const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// POST submit contact form (Public)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone').optional().trim().escape(),
    body('message').trim().notEmpty().withMessage('Message is required').escape(),
    body('serviceType').optional().trim().escape(),
    body('location').optional().trim().escape(),
    body('landSize').optional().trim().escape(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, message, serviceType, location, landSize } = req.body;

    // Compose formatted message including metadata
    let formattedMessage = message;
    if (serviceType || location || landSize) {
      formattedMessage = `[Service: ${serviceType || 'Not specified'}] | [Location: ${location || 'Not specified'}] | [Land Size: ${landSize || 'Not specified'}]\n\n${message}`;
    }

    let savedContact = { name, email, phone, message: formattedMessage, created_at: new Date().toISOString() };

    // 1. Save to Database (resilient: log warning if DB connection fails)
    try {
      const result = await db.query(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, phone, formattedMessage]
      );
      if (result.rows && result.rows.length > 0) {
        savedContact = result.rows[0];
      }
    } catch (dbErr) {
      console.warn('[Contact] Database insert warning (continuing with email delivery):', dbErr.message);
    }

    // 2. Send Emails via Resend if API key is present
    if (process.env.RESEND_API_KEY) {
      const sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const adminEmail = process.env.BOSS_EMAIL || 'sourcelineltd@gmail.com';

      // Admin alert email
      resend.emails.send({
        from: `Sourceline Inquiries <${sender}>`,
        to: [adminEmail],
        subject: `New Survey Inquiry from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; color: #000440; line-height: 1.6;">
            <div style="background-color: #000440; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0;">New Survey Inquiry</h2>
              <p style="color: #FF6806; margin: 4px 0 0 0; font-size: 14px;">Sourceline Limited Web Portal</p>
            </div>
            <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${phone || ''}">${phone || 'Not provided'}</a></p>
              <p><strong>Service Requested:</strong> ${serviceType || 'Not specified'}</p>
              <p><strong>Project Location:</strong> ${location || 'Not specified'}</p>
              <p><strong>Land Size:</strong> ${landSize || 'Not specified'}</p>
              <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #FF6806; margin-top: 16px; border-radius: 4px;">
                <strong>Message Details:</strong><br />
                <p style="white-space: pre-line; margin: 8px 0 0 0;">${message}</p>
              </div>
            </div>
          </div>
        `
      }).catch(e => console.error('[Contact] Resend admin error:', e.message));

      // User acknowledgment email
      resend.emails.send({
        from: `Sourceline Limited <${sender}>`,
        to: [email],
        subject: 'We have received your survey inquiry — Sourceline Limited',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; color: #000440; line-height: 1.6;">
            <div style="background-color: #000440; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0;">Sourceline Limited</h2>
              <p style="color: #FF6806; margin: 4px 0 0 0; font-size: 14px;">Precision Surveying & Geoinformatics</p>
            </div>
            <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for contacting Sourceline Limited regarding your project.</p>
              <p>Our team of SURCON-registered surveyors and geospatial consultants has received your inquiry. A representative will review your project requirements and attend to you shortly with a structured quotation.</p>
              <p>For immediate assistance or priority dispatch, you can also connect directly with us on WhatsApp at <a href="https://wa.me/2348034618227">+234 803 461 8227</a>.</p>
              <br />
              <p style="margin: 0;">Warm regards,</p>
              <p style="margin: 0; font-weight: bold;">Sourceline Limited Team</p>
              <p style="font-size: 12px; color: #718096; margin-top: 4px;">Crown Court Terrace Vintage Estate, Sangotedo, Lagos State</p>
            </div>
          </div>
        `
      }).catch(e => console.error('[Contact] Resend user error:', e.message));
    }

    res.status(201).json({
      message: 'Inquiry submitted successfully!',
      data: savedContact
    });
  }
);

// GET all contacts (Protected - Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows || []);
  } catch (err) {
    console.error('[Contact] Error fetching contacts:', err.message);
    res.status(500).json({ message: 'Error retrieving contacts', error: err.message });
  }
});

// DELETE a contact (Protected - Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

