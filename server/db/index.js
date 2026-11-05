const dns = require('dns');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const isProduction = process.env.NODE_ENV === 'production';

// Automatically rewrite IPv6-only Supabase direct hosts (db.<ref>.supabase.co)
// to the IPv4 Supavisor pooler so hosts without IPv6 (e.g. Render) can connect.
function normalizeDatabaseUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    const match = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (match) {
      const projectRef = match[1];
      const poolerRegion = process.env.SUPABASE_POOLER_HOST || 'aws-1-eu-central-1.pooler.supabase.com';
      if (!parsed.username.includes('.')) {
        parsed.username = `${parsed.username}.${projectRef}`;
      }
      parsed.hostname = poolerRegion;
      if (!parsed.port) parsed.port = '5432';
      console.log(`[DB] Auto-converted IPv6 Supabase host to IPv4 pooler (${poolerRegion})`);
      return parsed.toString();
    }
  } catch (err) {
    console.warn('[DB] URL parse warning:', err.message);
  }
  return rawUrl;
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const ensureSchema = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        location VARCHAR(255),
        image TEXT,
        description TEXT,
        details TEXT,
        gallery TEXT[],
        services TEXT[],
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
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

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        surcon_number TEXT,
        image TEXT,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS daily_reports (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        is_public_holiday BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE daily_reports
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

      CREATE TABLE IF NOT EXISTS worker_activities (
        id SERIAL PRIMARY KEY,
        daily_report_id INTEGER REFERENCES daily_reports(id) ON DELETE CASCADE,
        worker_name VARCHAR(255) NOT NULL,
        activity TEXT NOT NULL,
        category TEXT DEFAULT 'Office',
        site_gone_to TEXT,
        client_name TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE worker_activities
        ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Office',
        ADD COLUMN IF NOT EXISTS site_gone_to TEXT,
        ADD COLUMN IF NOT EXISTS client_name TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);

    // Ensure default admin account exists
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (Number(userCount.rows[0]?.count || 0) === 0) {
      const hash = await bcrypt.hash('password123', 10);
      await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
        ['admin', hash]
      );
    }
  } catch (err) {
    console.warn('[DB] Schema check warning:', err.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  ensureSchema();
}

module.exports = {
  pool,
  ensureSchema,
  query: (text, params) => pool.query(text, params),
};
