const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');
const { WS_MESSAGE_TYPES } = require('shared');

// Load environment variables - hybrid approach
// 1. Load root .env first (shared variables)
dotenv.config({ path: '../../.env' });
// 2. Load package-specific .env (overrides root .env if exists)
dotenv.config({ path: './.env' });

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/test', require('./routes/test'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API',
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
      type: WS_MESSAGE_TYPES.ECHO,
      message: message.toString(),
      timestamp: new Date().toISOString()
    }));
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: WS_MESSAGE_TYPES.WELCOME,
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

const PORT = process.env.BACKEND_PORT || process.env.PORT;

if (!PORT) {
  console.error('❌ ERROR: No port specified in environment variables!');
  console.error('Please set BACKEND_PORT or PORT in your .env file');
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Using BACKEND_PORT from .env: ${process.env.BACKEND_PORT}`);
});

module.exports = app;
