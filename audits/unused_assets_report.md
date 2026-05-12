# Unused Assets Report

This document outlines files and images within the `sourceline` project that are currently unreferenced in the source code. These assets can be safely deleted to reduce the project size, optimize load times, and improve maintainability.

## 🖼️ Unused Images
The following images were found in the `client/public/images/` and `client/src/assets/` directories but are **not** referenced anywhere in the `src/` codebase (including components, pages, and `data.js`):

- `client/public/images/20250515_134229.jpg.jpeg`
- `client/public/images/20250515_142652.jpg.jpeg`
- `client/public/images/IMG-20250820-WA0021.jpg.jpeg`
- `client/src/assets/react.svg` (Default Vite asset)

*(Note: `client/public/images/image.png` and `client/public/images/team/image.png` are correctly referenced inside `data.js` and `QuotationBuilder.jsx`, so they are **not** listed here).*

---

## 📄 Unused Components & Source Files
The following files exist in the `client/src/` structure but are not imported or utilized by any other component or route:

- `client/src/components/SEO.test.jsx`
  - **Reason:** Empty or unused test file. Safe to delete if testing is not configured for SEO.
- `client/src/lib/supabaseClient.js`
  - **Reason:** Created for Supabase integration but not currently imported anywhere in the application.

---

## 🛠️ Server Utility Scripts
The `server/` directory contains several utility scripts that were likely used during initial setup or migration. While they are not "unused" in the strict sense (they might be run manually), they are not part of the active production runtime. You may consider moving them to a `scripts/` or `tools/` directory to declutter the root server folder:

- `server/generate_sitemap.js`
- `server/migrate_services.js`
- `server/seed.js`
- `server/seed_db.js`
- `server/setup_db.js`

---

## ✅ Recommendation
1. Review the images listed above. If they are not planned for future blog posts or portfolio entries, delete them.
2. Delete `SEO.test.jsx` and `react.svg`.
3. If Supabase is no longer the chosen database path (or is fully handled differently), delete `supabaseClient.js`.
4. Create a `server/scripts/` folder and move the database/sitemap utility scripts there to keep the root server directory clean.
