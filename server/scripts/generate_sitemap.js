
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BASE_URL = 'https://www.sourceline.com.ng';

async function generateSitemap() {
  try {
    console.log('Generating sitemap...');
    const client = await pool.connect();

    // 1. Static Routes
    const staticRoutes = [
      '/',
      '/about',
      '/services',
      '/portfolio',
      '/contact',
      '/blog',
      '/privacy'
    ];

    // 2. Fetch Dynamic Routes
    // Services
    const servicesRes = await client.query('SELECT slug, updated_at FROM services');
    const serviceRoutes = servicesRes.rows.map(row => ({
      url: `/services/${row.slug}`,
      lastmod: row.updated_at
    }));

    // Blog Posts
    const blogRes = await client.query('SELECT slug, updated_at FROM blog_posts');
    const blogRoutes = blogRes.rows.map(row => ({
      url: `/blog/${row.slug}`,
      lastmod: row.updated_at
    }));

    // 3. Build XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add Static Routes
    staticRoutes.forEach(route => {
      sitemap += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
    });

    // Add Dynamic Routes (Services)
    serviceRoutes.forEach(route => {
      sitemap += `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${new Date(route.lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Add Dynamic Routes (Blog)
    blogRoutes.forEach(route => {
      sitemap += `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${new Date(route.lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    // 4. Write to file
    // Assuming this script runs in /server, we want to write to ../client/public/sitemap.xml
    const outputPath = path.join(__dirname, '../client/public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);

    console.log(`Sitemap generated successfully at ${outputPath}`);
    
    client.release();
  } catch (err) {
    console.error('Error generating sitemap:', err);
  } finally {
    await pool.end();
  }
}

generateSitemap();
