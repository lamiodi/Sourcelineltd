# Sourceline Limited - Project Blueprint

## 1. Project Overview
The **Sourceline Limited Website** is a full-stack web application designed for a registered land surveying and geoinformatics firm in Nigeria. 
It serves as the digital front door for the business, allowing prospective clients to explore services, view past projects, verify the company's legitimacy (SURCON, CAC), read the blog, and request quotes or contact the firm. It also includes an administrative dashboard to manage the site's content.

## 2. Tech Stack Architecture

### Frontend (Client)
- **Framework:** React (v18)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, PostCSS
- **Animations:** Framer Motion, GSAP
- **Routing:** React Router DOM
- **PDF Generation:** jspdf, html2canvas
- **Markdown:** react-markdown
- **Testing:** Vitest, React Testing Library
- **Icons:** @phosphor-icons/react

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (managed via Supabase)
- **Authentication:** Supabase Auth & JWT (`jsonwebtoken`)
- **Storage/Media:** Cloudinary (with `multer` and `multer-storage-cloudinary`)
- **Email Service:** Nodemailer, Resend
- **Security:** Helmet, express-rate-limit, cors, bcryptjs
- **Tasks:** node-cron for scheduled jobs

## 3. Directory Structure

### Root
- `/client` - Frontend React application.
- `/server` - Backend Express server.
- `/database` - Database resources and setup information.
- `/docs`, `/audits` - Documentation and project audits.

### Client (`/client/src`)
- **`/pages`**: Contains the main route views.
  - **Public Pages**: `Home.jsx`, `About.jsx`, `Services.jsx`, `ServiceDetail.jsx`, `Portfolio.jsx`, `ProjectDetail.jsx`, `Blog.jsx`, `BlogDetail.jsx`, `Contact.jsx`, `Verify.jsx`, `Privacy.jsx`, `NotFound.jsx`.
  - **Admin Pages (`/admin`)**: Dashboard views for managing Daily Reports, Projects, logging in (`Login.jsx`, `AdminLayout.jsx`), and other content.
- **`/components`**: Reusable UI elements (e.g., `Preloader.jsx`, `SEO.jsx`, `Faq.jsx`, `LogoStream.jsx`).
- **`/layout`**: Layout components like `Footer.jsx`.
- **`/hooks`**: Custom React hooks.
- **`/lib`**: Utility functions and libraries.

### Server (`/server`)
- **`/routes`**: Express API routers.
  - `auth.js` - Admin authentication and sessions.
  - `blog.js` - Blog post management.
  - `contact.js` - Handling contact form submissions.
  - `dailyReports.js` - Managing daily operations/reports.
  - `newsletter.js` - Newsletter subscriptions.
  - `projects.js` - Portfolio projects management.
  - `team.js` - Team member management.
- **`/middleware`**: Custom Express middlewares (e.g., authentication, error handling).
- **`/db`**: Database connection and queries.
- **`/cron`**: Automated scheduled jobs (e.g., database cleanup, scheduled emails).
- **`/scripts`**: Utility scripts (e.g., `setup_db.js`).

## 4. Database Schema Overview
*(Managed via Supabase PostgreSQL)*
Based on the API routes and setup, the primary entities include:
- `users` (Admin authentication)
- `services` (Company offerings)
- `projects` (Portfolio items)
- `team_members` (Staff details)
- `blog_posts` (News and updates)
- `contacts` (Inquiries from users)
- `subscribers` (Newsletter signups)
- `daily_reports` (Admin operations)

## 5. Deployment Setup
- **Frontend**: Ready for deployment to platforms like Vercel (configured via `vercel.json`), Netlify, or similar static hosts.
- **Backend**: Can be hosted on Node.js-compatible environments like Render, Heroku, or Railway.
- **Database**: Remote PostgreSQL database hosted on Supabase.
