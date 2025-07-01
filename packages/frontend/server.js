const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Log the current working directory and dist path
console.log('Current working directory:', process.cwd());
console.log('Server file location:', __dirname);
console.log('Dist path:', path.join(__dirname, 'dist'));

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ Dist directory exists');
  const files = fs.readdirSync(distPath);
  console.log('Files in dist:', files);
} else {
  console.error('❌ Dist directory not found!');
}

// Serve static files from the dist directory with proper MIME types
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    console.log('Serving static file:', filePath);
    if (filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    } else if (filePath.endsWith('sw.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Specific routes for PWA files to ensure they're served correctly
app.get('/manifest.json', (req, res) => {
  const manifestPath = path.join(distPath, 'manifest.json');
  console.log('Attempting to serve manifest from:', manifestPath);
  console.log('Manifest exists:', fs.existsSync(manifestPath));
  
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Manifest file not found at:', manifestPath);
    return res.status(404).json({ error: 'Manifest not found', path: manifestPath });
  }
  
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(manifestPath, (err) => {
    if (err) {
      console.error('Error serving manifest.json:', err);
      res.status(500).json({ error: 'Error serving manifest', details: err.message });
    } else {
      console.log('✅ Manifest served successfully');
    }
  });
});

app.get('/sw.js', (req, res) => {
  const swPath = path.join(distPath, 'sw.js');
  console.log('Attempting to serve service worker from:', swPath);
  console.log('Service worker exists:', fs.existsSync(swPath));
  
  if (!fs.existsSync(swPath)) {
    console.error('❌ Service worker file not found at:', swPath);
    return res.status(404).json({ error: 'Service worker not found', path: swPath });
  }
  
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(swPath, (err) => {
    if (err) {
      console.error('Error serving sw.js:', err);
      res.status(500).json({ error: 'Error serving service worker', details: err.message });
    } else {
      console.log('✅ Service worker served successfully');
    }
  });
});

app.get('/offline.html', (req, res) => {
  const offlinePath = path.join(distPath, 'offline.html');
  console.log('Attempting to serve offline page from:', offlinePath);
  console.log('Offline page exists:', fs.existsSync(offlinePath));
  
  if (!fs.existsSync(offlinePath)) {
    console.error('❌ Offline page not found at:', offlinePath);
    return res.status(404).json({ error: 'Offline page not found', path: offlinePath });
  }
  
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(offlinePath, (err) => {
    if (err) {
      console.error('Error serving offline.html:', err);
      res.status(500).json({ error: 'Error serving offline page', details: err.message });
    } else {
      console.log('✅ Offline page served successfully');
    }
  });
});

// Debug route to check what files exist
app.get('/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(distPath);
    res.json({
      distPath,
      files,
      manifestExists: fs.existsSync(path.join(distPath, 'manifest.json')),
      swExists: fs.existsSync(path.join(distPath, 'sw.js')),
      offlineExists: fs.existsSync(path.join(distPath, 'offline.html'))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle React Router (return `index.html` for all non-API routes)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('Serving index.html for route:', req.url);
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the app`);
});
