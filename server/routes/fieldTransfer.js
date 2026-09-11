const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory temporary storage for active field transfers
// Key: normalized 6-character code (e.g., "739214")
// Value: { id, code, displayCode, filename, content, pointCount, fileSize, createdAt, expiresAt }
const activeTransfers = new Map();

// Helper: Generate a unique, user-friendly 6-digit numerical transfer PIN
function generateTransferPin() {
  for (let i = 0; i < 100; i++) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    if (!activeTransfers.has(pin)) {
      return pin;
    }
  }
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Auto-purge routine: run every 30 seconds to clean up expired files (> 1 hour)
const purgeTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, transfer] of activeTransfers.entries()) {
    if (now >= transfer.expiresAt) {
      activeTransfers.delete(key);
    }
  }
}, 30 * 1000);
if (purgeTimer.unref) {
  purgeTimer.unref();
}

/**
 * POST /api/field-transfer/upload
 * Staging a CSV file for a data collector.
 * Defaults to 60 minutes (1 hour) TTL.
 */
router.post('/upload', (req, res) => {
  try {
    const { filename, content, jobName, pointCount, ttlMinutes = 60 } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'CSV file content is required.' });
    }

    const safeName = (filename || jobName || 'Field_Survey_Points.csv').replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFilename = safeName.toLowerCase().endsWith('.csv') ? safeName : `${safeName}.csv`;

    // Calculate expiration (between 5 and 180 mins, default 60 = 1 hour)
    const validTtlMinutes = Math.min(Math.max(Number(ttlMinutes) || 60, 5), 180);
    const now = Date.now();
    const expiresAt = now + validTtlMinutes * 60 * 1000;

    const pin = generateTransferPin();
    const displayCode = `${pin.slice(0, 3)}-${pin.slice(3)}`;
    const id = crypto.randomUUID();

    const transferData = {
      id,
      code: pin,
      displayCode,
      filename: finalFilename,
      content: content.trim(),
      pointCount: Number(pointCount) || 0,
      fileSize: Buffer.byteLength(content, 'utf8'),
      jobName: jobName || 'Survey Job',
      createdAt: now,
      expiresAt
    };

    activeTransfers.set(pin, transferData);

    return res.status(201).json({
      success: true,
      id,
      code: pin,
      displayCode,
      filename: finalFilename,
      pointCount: transferData.pointCount,
      fileSize: transferData.fileSize,
      createdAt: now,
      expiresAt,
      remainingSeconds: Math.floor((expiresAt - now) / 1000),
      message: `File staged successfully. Auto-destructs in ${validTtlMinutes} minutes.`
    });
  } catch (err) {
    console.error('Error staging field transfer:', err);
    return res.status(500).json({ error: 'Failed to stage file on field hub.' });
  }
});

/**
 * GET /api/field-transfer/:code
 * Fetch temporary transfer by PIN code.
 */
router.get('/:code', (req, res) => {
  try {
    const rawCode = req.params.code || '';
    const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '');

    const transfer = activeTransfers.get(cleanCode);

    if (!transfer) {
      return res.status(404).json({
        error: 'Transfer code not found or expired. Coordinates have been automatically purged.'
      });
    }

    const now = Date.now();
    if (now >= transfer.expiresAt) {
      activeTransfers.delete(cleanCode);
      return res.status(410).json({
        error: 'This survey package has expired (1-hour limit reached) and was self-destructed.'
      });
    }

    return res.json({
      success: true,
      id: transfer.id,
      code: transfer.code,
      displayCode: transfer.displayCode,
      filename: transfer.filename,
      content: transfer.content,
      pointCount: transfer.pointCount,
      fileSize: transfer.fileSize,
      jobName: transfer.jobName,
      createdAt: transfer.createdAt,
      expiresAt: transfer.expiresAt,
      remainingSeconds: Math.floor((transfer.expiresAt - now) / 1000)
    });
  } catch (err) {
    console.error('Error fetching field transfer:', err);
    return res.status(500).json({ error: 'Failed to retrieve transfer package.' });
  }
});

/**
 * GET /api/field-transfer/:code/download
 * Direct download endpoint for Data Collector / PDA browsers.
 */
router.get('/:code/download', (req, res) => {
  try {
    const rawCode = req.params.code || '';
    const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '');

    const transfer = activeTransfers.get(cleanCode);

    if (!transfer) {
      return res.status(404).send('Transfer expired or not found. File was permanently purged.');
    }

    const now = Date.now();
    if (now >= transfer.expiresAt) {
      activeTransfers.delete(cleanCode);
      return res.status(410).send('File expired (1-hour limit) and was purged.');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${transfer.filename}"`);
    return res.send(transfer.content);
  } catch (err) {
    console.error('Error downloading field transfer:', err);
    return res.status(500).send('Download failed.');
  }
});

/**
 * DELETE /api/field-transfer/:code
 * Immediate manual purge by surveyor.
 */
router.delete('/:code', (req, res) => {
  try {
    const rawCode = req.params.code || '';
    const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '');

    if (activeTransfers.has(cleanCode)) {
      activeTransfers.delete(cleanCode);
      return res.json({ success: true, message: 'File was immediately purged from field hub.' });
    }

    return res.status(404).json({ error: 'Transfer not found or already deleted.' });
  } catch (err) {
    console.error('Error deleting field transfer:', err);
    return res.status(500).json({ error: 'Failed to delete transfer package.' });
  }
});

module.exports = router;
