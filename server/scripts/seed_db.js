
const path = require('path');
const { pathToFileURL } = require('url');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db');

async function seed() {
  try {
    console.log('Ensuring database schema...');
    await db.ensureSchema();

    const dataModuleUrl = pathToFileURL(path.join(__dirname, '../../client/src/data.js')).href;
    const { projects, team, blogPosts } = await import(dataModuleUrl);

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Seed Projects
      console.log('Seeding Projects...');
      for (const project of projects) {
        const res = await client.query('SELECT id FROM projects WHERE title = $1', [project.title]);
        if (res.rows.length === 0) {
          await client.query(
            'INSERT INTO projects (title, category, location, image, description, details, services) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
              project.title,
              project.category,
              project.location,
              project.image,
              project.description,
              project.details || '',
              project.services || []
            ]
          );
        }
      }

      // 2. Seed Team Members
      console.log('Seeding Team Members...');
      for (const member of team) {
        const res = await client.query('SELECT id FROM team_members WHERE name = $1', [member.name]);
        if (res.rows.length === 0) {
          await client.query(
            'INSERT INTO team_members (name, position, surcon_number, image, bio) VALUES ($1, $2, $3, $4, $5)',
            [member.name, member.position, member.surcon_number, member.image, member.bio]
          );
        }
      }

      // 3. Seed Blog Posts
      console.log('Seeding Blog Posts...');
      for (const post of blogPosts) {
        const res = await client.query('SELECT id FROM blog_posts WHERE slug = $1', [post.slug]);
        if (res.rows.length === 0) {
          await client.query(
            'INSERT INTO blog_posts (title, slug, excerpt, content, image, author, category, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [
              post.title,
              post.slug,
              post.excerpt,
              post.content,
              post.image,
              post.author,
              post.category,
              post.published_at ? new Date(post.published_at) : new Date()
            ]
          );
        }
      }

      await client.query('COMMIT');
      console.log('Database seed completed successfully.');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

seed();
