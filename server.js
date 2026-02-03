#!/usr/bin/env node

/**
 * Simple Express server for serving the cinematicRenderer2D playground
 * Optimized for GoDaddy Node.js hosting
 */

const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Enable gzip compression
app.use(compression());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Force HTTPS in production (if behind proxy)
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && req.hostname !== 'localhost') {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// Serve static files from dist-playground
app.use(express.static(path.join(__dirname, 'dist-playground'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
  lastModified: true,
}));

// Cache control for specific file types
app.use('/assets', express.static(path.join(__dirname, 'dist-playground/assets'), {
  maxAge: '1y', // Cache assets for 1 year (they have hashed names)
  immutable: true,
}));

app.use('/examples', express.static(path.join(__dirname, 'dist-playground/examples'), {
  maxAge: '1h', // Cache examples for 1 hour
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// API endpoint to get available examples
app.get('/api/examples', (req, res) => {
  res.json({
    examples: [
      {
        id: 'simple',
        name: 'Simple Demo',
        url: '/examples/simple-demo-spec.json'
      },
      {
        id: 'story',
        name: 'Story Narration',
        url: '/examples/story-narration-spec.json'
      },
      {
        id: 'daynight',
        name: 'Day & Night Story',
        url: '/examples/day-night-story-spec.json'
      }
    ]
  });
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  // Check if requesting getting-started page
  if (req.path === '/getting-started.html' || req.path === '/getting-started') {
    res.sendFile(path.join(__dirname, 'dist-playground', 'getting-started.html'));
  } else {
    // Default to index.html for all other routes
    res.sendFile(path.join(__dirname, 'dist-playground', 'index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🎬 cinematicRenderer2D Playground Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('Server is running! Press Ctrl+C to stop.');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
