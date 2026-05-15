const { v4: uuidv4 } = require('uuid');

/**
 * Generate a human-readable tracking ID for issues
 * Format: CC-YYYYMMDD-XXXX (e.g., CC-20260509-A3F2)
 */
const generateTrackingId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = uuidv4().slice(0, 4).toUpperCase();
  return `CC-${dateStr}-${suffix}`;
};

/**
 * Standard success response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response
 */
const errorResponse = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Handle validation errors from express-validator
 */
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  generateTrackingId,
  successResponse,
  errorResponse,
  handleValidationErrors
};
