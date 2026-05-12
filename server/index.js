const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Is not production:', process.env.NODE_ENV !== 'production');

// Security Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const projectRoutes = require('./routes/projects');
const teamRoutes = require('./routes/team');
const blogRoutes = require('./routes/blog');
const newsletterRoutes = require('./routes/newsletter');
const dailyReportRoutes = require('./routes/dailyReports');
const { initCronJobs } = require('./cron/dailyReportCron');

// Initialize Cron Jobs
if (process.env.NODE_ENV !== 'test') {
  initCronJobs();
}

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'https://www.sourcelineltd.com', 
  'https://sourcelineltd.com'
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/daily-reports', dailyReportRoutes);

app.get('/', (req, res) => {
  res.send('Sourceline Server is running');
});

// For local development and production
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
