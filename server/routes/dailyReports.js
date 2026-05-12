const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authenticateToken = require('../middleware/authMiddleware');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get report for a specific date
router.get('/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Get the daily report
    const reportResult = await pool.query(
      'SELECT * FROM daily_reports WHERE date = $1',
      [date]
    );

    let report = reportResult.rows[0];

    // If no report exists, create a default empty state response
    if (!report) {
      return res.json({ date, is_public_holiday: false, activities: [] });
    }

    // Get the activities
    const activitiesResult = await pool.query(
      'SELECT * FROM worker_activities WHERE daily_report_id = $1',
      [report.id]
    );

    res.json({
      ...report,
      activities: activitiesResult.rows
    });
  } catch (error) {
    console.error('Error fetching daily report:', error);
    res.status(500).json({ message: 'Server error fetching daily report' });
  }
});

// Create or update daily report and activities
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { date, is_public_holiday, activities } = req.body;
    
    await client.query('BEGIN');

    // Upsert daily report
    const reportResult = await client.query(
      `INSERT INTO daily_reports (date, is_public_holiday, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (date) DO UPDATE SET is_public_holiday = EXCLUDED.is_public_holiday, updated_at = NOW() 
       RETURNING *`,
      [date, is_public_holiday]
    );
    
    const reportId = reportResult.rows[0].id;

    // Remove existing activities for this report
    await client.query('DELETE FROM worker_activities WHERE daily_report_id = $1', [reportId]);

    // Insert new activities if not a public holiday
    if (!is_public_holiday && activities && activities.length > 0) {
      for (const act of activities) {
        if (act.worker_name && act.activity) {
          await client.query(
            'INSERT INTO worker_activities (daily_report_id, worker_name, activity, category, site_gone_to) VALUES ($1, $2, $3, $4, $5)',
            [reportId, act.worker_name, act.activity, act.category || 'Office', act.site_gone_to || '']
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Daily report saved successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving daily report:', error);
    res.status(500).json({ message: 'Server error saving daily report' });
  } finally {
    client.release();
  }
});

module.exports = router;
