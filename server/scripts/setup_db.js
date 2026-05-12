
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  try {
    console.log('Starting database setup...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Enable UUID extension
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('UUID extension enabled');

      // 2. Create Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT \'user\'');
      console.log('Users table checked/created');

      // 3. Create Services Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS services (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('Services table checked/created');

      // 3.1 Alter Services Table (Add missing columns)
      await client.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE');
      await client.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS details TEXT');
      console.log('Services table altered (slug, details)');

      // 4. Create Projects Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          location TEXT,
          image TEXT,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('Projects table checked/created');

      // 5. Create Team Members Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          surcon_number TEXT,
          image TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('Team Members table checked/created');

      // 6. Create Blog Posts Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT,
          content TEXT NOT NULL,
          image TEXT,
          author TEXT,
          category TEXT,
          published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('Blog Posts table checked/created');

      // 7. Create Contacts Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('Contacts table checked/created');

      // 8. Create Subscribers Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE
        );
      `);
      console.log('Subscribers table checked/created');

      await client.query('COMMIT');
      console.log('Database setup completed successfully.');
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
