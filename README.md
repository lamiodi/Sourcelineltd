# Sourceline Limited Website

This is the official website for **Sourceline Limited**, a registered land surveying and geoinformatics firm in Nigeria.

## Project Overview

The website is a full-stack application designed to:
- Showcase Sourceline's services and portfolio.
- Provide a platform for clients to verify the company's legitimacy (SURCON, CAC).
- Allow clients to request quotes and contact the firm.
- Manage content (projects, services, blog) via an Admin Dashboard.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth / JWT

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Supabase project (for Database and Auth)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd sourceline
```

### 2. Client Setup

Navigate to the client directory and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in `client/` based on `.env.example` (if available) or with the following:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd ../server
npm install
```

Create a `.env` file in `server/` with the following:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Database Setup

The project includes a setup script to initialize the database tables.

```bash
cd server
node setup_db.js
```

This will create the necessary tables: `users`, `services`, `projects`, `team_members`, `blog_posts`, `contacts`, and `subscribers`.

## Running the Application

### Development Mode

You need to run both the client and server terminals.

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:5000`.

### Production Build

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Serve the built files using the server (ensure server is configured to serve static files) or deploy client to Vercel/Netlify and server to Render/Heroku.

## API Endpoints

### Public
- `GET /api/services` - List all services
- `GET /api/projects` - List all projects
- `GET /api/team` - List team members
- `GET /api/blog` - List blog posts
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Protected (Admin)
- `POST /api/auth/login` - Admin login
- `POST /api/services` - Add new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- (Similar endpoints for projects, team, blog)

## Deployment

The project is configured for deployment.
- **Frontend:** Can be deployed to Vercel (see `vercel.json` in root).
- **Backend:** Can be deployed to Render, Railway, or Heroku.
- **Database:** Managed by Supabase.

## License

Private. Sourceline Limited.
