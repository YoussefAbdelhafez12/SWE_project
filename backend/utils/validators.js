const { body, param, query } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['community_member', 'facility_manager', 'worker', 'admin'])
    .withMessage('Invalid role'),
  body('employee_id')
    .optional()
    .trim()
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const issueValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('category_id')
    .notEmpty().withMessage('Category is required')
    .isUUID().withMessage('Invalid category'),
  body('location_type')
    .notEmpty().withMessage('Location type is required')
    .isIn(['indoor', 'outdoor']).withMessage('Location type must be indoor or outdoor'),
  body('building')
    .optional().trim(),
  body('room_floor')
    .optional().trim(),
  body('location_description')
    .optional().trim()
];

const statusUpdateValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'assigned', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('comment')
    .optional()
    .trim()
];

const assignValidation = [
  body('worker_id')
    .notEmpty().withMessage('Worker ID is required')
    .isUUID().withMessage('Invalid worker ID')
];

const commentValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters')
];

const idParamValidation = [
  param('id').isUUID().withMessage('Invalid ID format')
];

module.exports = {
  registerValidation,
  loginValidation,
  issueValidation,
  statusUpdateValidation,
  assignValidation,
  commentValidation,
  idParamValidation
};
