const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

// Test route to verify API is working
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test Supabase connection
router.get('/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Supabase connection failed',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supabase connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Supabase connection error',
      error: error.message
    });
  }
});

module.exports = router;
