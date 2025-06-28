const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/test', require('./routes/test'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Boilerplate Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/test/health',
      supabase: '/api/test/supabase'
    }
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // Echo the message back
    ws.send(JSON.stringify({
      type: 'echo',
      message: message.toString(),
      timestamp: new Date().toISOString()
    }));
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to WebSocket server',
    timestamp: new Date().toISOString()
  }));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
