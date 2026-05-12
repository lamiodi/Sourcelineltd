
require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Check if columns exist first to avoid errors
    // Adding slug
    try {
      await db.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE');
      console.log('Added slug column');
    } catch (e) {
      console.log('Error adding slug:', e.message);
    }

    // Adding details
    try {
      await db.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS details TEXT');
      console.log('Added details column');
    } catch (e) {
      console.log('Error adding details:', e.message);
    }

    console.log('Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
