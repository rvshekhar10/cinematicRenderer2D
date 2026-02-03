#!/usr/bin/env node

/**
 * Minimal Hostinger Entry Point
 * This is the simplest possible server that will work with Hostinger
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('='.repeat(50));
console.log('Starting cinematicRenderer2D...');
console.log('PORT:', PORT);
console.log('CWD:', process.cwd());
console.log('='.repeat(50));

// Serve static files from dist-playground
app.use(express.static(path.join(__dirname, 'dist-playground')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist-playground', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('✅ Server running on port', PORT);
  console.log('Visit: http://localhost:' + PORT);
});
