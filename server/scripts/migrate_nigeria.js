require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    const client = await pool.connect();
    try {
      console.log('Migrating tables for Nigerian-specific fields...');
      
      // Update daily_reports table
      await client.query(`
        ALTER TABLE daily_reports 
        ADD COLUMN IF NOT EXISTS security_incidents TEXT,
        ADD COLUMN IF NOT EXISTS weather_conditions TEXT;
      `);

      // Update worker_activities table
      await client.query(`
        ALTER TABLE worker_activities 
        ADD COLUMN IF NOT EXISTS coordinate_system TEXT DEFAULT 'Minna Datum',
        ADD COLUMN IF NOT EXISTS cadastral_zone TEXT,
        ADD COLUMN IF NOT EXISTS equipment_used TEXT,
        ADD COLUMN IF NOT EXISTS calibration_status TEXT,
        ADD COLUMN IF NOT EXISTS registry_status TEXT;
      `);
      
      console.log('Migration completed successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();