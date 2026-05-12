require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    const client = await pool.connect();
    try {
      console.log('Migrating worker_activities table...');
      
      // Add columns
      await client.query(`
        ALTER TABLE worker_activities 
        ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Office',
        ADD COLUMN IF NOT EXISTS site_gone_to TEXT,
        ADD COLUMN IF NOT EXISTS client_name TEXT;
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
