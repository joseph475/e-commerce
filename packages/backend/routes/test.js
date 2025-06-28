const express = require('express');
const { supabase } = require('../config/supabase');
const { createSuccessResponse, createErrorResponse, HTTP_STATUS } = require('shared');
const router = express.Router();

// Test route to verify API is working
router.get('/health', (req, res) => {
  const data = {
    environment: process.env.NODE_ENV || 'development'
  };
  res.status(HTTP_STATUS.OK).json(createSuccessResponse(data, 'Backend API is working!'));
});

// Test Supabase connection
router.get('/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse(error, 'Supabase connection failed'));
    }

    res.status(HTTP_STATUS.OK)
      .json(createSuccessResponse(null, 'Supabase connection successful!'));
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(createErrorResponse(error, 'Supabase connection error'));
  }
});

module.exports = router;
