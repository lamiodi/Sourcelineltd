const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../db');

// In-memory fallback if remote database is unreachable
let memoryQuotations = [];

// Initialize quotations table if it doesn't exist yet
const initTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR(100) PRIMARY KEY,
        quotation_number VARCHAR(100) NOT NULL,
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        client_phone VARCHAR(100),
        client_address TEXT,
        subject VARCHAR(255),
        date VARCHAR(50),
        valid_until VARCHAR(50),
        tax_rate NUMERIC DEFAULT 7.5,
        currency VARCHAR(10) DEFAULT '₦',
        terms TEXT,
        items JSONB,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.warn('[Quotations] Table initialization skipped or connection offline:', err.message);
  }
};

initTable();

// GET all quotations (Protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM quotations ORDER BY updated_at DESC');
    if (result.rows && result.rows.length > 0) {
      return res.json(result.rows.map(row => row.data || row));
    }
    return res.json(memoryQuotations);
  } catch (err) {
    console.warn('[Quotations] DB read fallback to memory:', err.message);
    res.json(memoryQuotations);
  }
});

// GET single quotation by ID (Protected)
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM quotations WHERE id = $1 OR quotation_number = $1',
      [id]
    );
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      return res.json(row.data || row);
    }
    const memItem = memoryQuotations.find(q => q.id === id || q.quotationNumber === id);
    if (memItem) return res.json(memItem);

    return res.status(404).json({ message: 'Quotation not found' });
  } catch (err) {
    const memItem = memoryQuotations.find(q => q.id === id || q.quotationNumber === id);
    if (memItem) return res.json(memItem);
    res.status(500).json({ message: err.message });
  }
});

// POST save / upsert quotation (Protected)
router.post('/', verifyToken, async (req, res) => {
  const quote = req.body;
  if (!quote.id) {
    quote.id = 'QT-' + Date.now();
  }
  quote.savedAt = new Date().toISOString();

  // Save to memory cache
  const existingIdx = memoryQuotations.findIndex(q => q.id === quote.id);
  if (existingIdx >= 0) {
    memoryQuotations[existingIdx] = quote;
  } else {
    memoryQuotations.unshift(quote);
  }

  // Persist to Postgres if available
  try {
    await db.query(`
      INSERT INTO quotations (id, quotation_number, client_name, client_email, client_phone, client_address, subject, date, valid_until, tax_rate, currency, terms, items, data, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        quotation_number = EXCLUDED.quotation_number,
        client_name = EXCLUDED.client_name,
        client_email = EXCLUDED.client_email,
        client_phone = EXCLUDED.client_phone,
        client_address = EXCLUDED.client_address,
        subject = EXCLUDED.subject,
        date = EXCLUDED.date,
        valid_until = EXCLUDED.valid_until,
        tax_rate = EXCLUDED.tax_rate,
        currency = EXCLUDED.currency,
        terms = EXCLUDED.terms,
        items = EXCLUDED.items,
        data = EXCLUDED.data,
        updated_at = NOW();
    `, [
      quote.id,
      quote.quotationNumber || quote.id,
      quote.clientName || '',
      quote.clientEmail || '',
      quote.clientPhone || '',
      quote.clientAddress || '',
      quote.subject || '',
      quote.date || '',
      quote.validUntil || '',
      quote.taxRate || 7.5,
      quote.currency || '₦',
      quote.terms || '',
      JSON.stringify(quote.items || []),
      JSON.stringify(quote)
    ]);
  } catch (err) {
    console.warn('[Quotations] DB write error (saved in memory):', err.message);
  }

  res.status(201).json({ message: 'Quotation saved successfully', quotation: quote });
});

// DELETE quotation (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  memoryQuotations = memoryQuotations.filter(q => q.id !== id);

  try {
    await db.query('DELETE FROM quotations WHERE id = $1', [id]);
  } catch (err) {
    console.warn('[Quotations] DB delete warning:', err.message);
  }

  res.json({ message: 'Quotation deleted successfully' });
});

module.exports = router;
