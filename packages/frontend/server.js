const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set proper MIME types for PWA files
app.use('/manifest.json', (req, res, next) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  next();
});

app.use('/sw.js', (req, res, next) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Specific routes for PWA files to ensure proper serving
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'dist', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'dist', 'sw.js'));
});

app.get('/offline.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'dist', 'offline.html'));
});

// Handle React Router (return `index.html` for all non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the app`);
});
