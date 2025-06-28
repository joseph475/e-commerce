// API Response Types
const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// WebSocket Message Types
const WS_MESSAGE_TYPES = {
  WELCOME: 'welcome',
  ECHO: 'echo',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat'
};

// Environment Types
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

// Validation Utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Date Utilities
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

// API Response Helpers
const createSuccessResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const createErrorResponse = (error, message = 'An error occurred') => ({
  success: false,
  message,
  error: error.message || error,
  timestamp: new Date().toISOString()
});

// Export all utilities
module.exports = {
  // Constants
  API_RESPONSE_TYPES,
  HTTP_STATUS,
  WS_MESSAGE_TYPES,
  ENVIRONMENTS,
  
  // Validation
  validateEmail,
  validatePassword,
  
  // Date utilities
  formatDate,
  formatDateTime,
  
  // API helpers
  createSuccessResponse,
  createErrorResponse
};
