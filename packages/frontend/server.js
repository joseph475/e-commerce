const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory with proper MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    } else if (filePath.endsWith('sw.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Specific routes for PWA files to ensure they're served correctly
app.get('/manifest.json', (req, res) => {
  const manifestPath = path.join(__dirname, 'dist', 'manifest.json');
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(manifestPath, (err) => {
    if (err) {
      console.error('Error serving manifest.json:', err);
      res.status(404).send('Manifest not found');
    }
  });
});

app.get('/sw.js', (req, res) => {
  const swPath = path.join(__dirname, 'dist', 'sw.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(swPath, (err) => {
    if (err) {
      console.error('Error serving sw.js:', err);
      res.status(404).send('Service worker not found');
    }
  });
});

app.get('/offline.html', (req, res) => {
  const offlinePath = path.join(__dirname, 'dist', 'offline.html');
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(offlinePath, (err) => {
    if (err) {
      console.error('Error serving offline.html:', err);
      res.status(404).send('Offline page not found');
    }
  });
});

// Handle React Router (return `index.html` for all non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the app`);
});
