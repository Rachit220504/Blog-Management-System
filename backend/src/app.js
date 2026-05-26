const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { corsOptions, apiLimiter } = require('./middleware/securityMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

// Route imports
const apiV1Routes = require('./routes/v1');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows images to be loaded on separate origins
}));
app.use(corsOptions);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(loggerMiddleware);

// Serve uploaded files statically
// This maps the URL path /uploads directly to the public/uploads filesystem directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Apply rate limiting to all API requests
app.use('/api', apiLimiter);

// Versioned API Route definitions
app.use('/api/v1', apiLimiter, apiV1Routes);

// Backward-compatible alias for existing clients
app.use('/api', apiLimiter, apiV1Routes);

// Root path diagnostic route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Blog Management System API is running smoothly',
  });
});

// Catch-all route for unhandled requests
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handler middleware
app.use(errorHandler);

module.exports = app;
