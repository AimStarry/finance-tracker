const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://finance-tracker-pearl-mu.vercel.app',
  ],
  credentials: true,
}));

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth requests, please try again later',
}));

// Logging & parsing
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
