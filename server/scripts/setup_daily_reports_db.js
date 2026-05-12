require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  try {
    console.log('Starting daily reports database setup...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Enable UUID extension
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // 2. Create Daily Reports Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_reports (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          date DATE UNIQUE NOT NULL,
          is_public_holiday BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('daily_reports table checked/created');

      // 3. Create Worker Activities Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS worker_activities (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          daily_report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
          worker_name TEXT NOT NULL,
          activity TEXT NOT NULL,
          category TEXT DEFAULT 'Office',
          site_gone_to TEXT,
          client_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('worker_activities table checked/created');

      await client.query('COMMIT');
      console.log('Daily reports database setup completed successfully.');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    await pool.end();
  }
}

setup();
