const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { idParamValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/helpers');
const adminController = require('../controllers/admin.controller');

// Admin-only routes
router.use(authenticate, authorize('admin'));

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id/status', idParamValidation, handleValidationErrors, adminController.updateUserStatus);
router.put('/users/:id/role', idParamValidation, handleValidationErrors, adminController.updateUserRole);

// FM Registration approvals
router.get('/pending-approvals', adminController.getPendingApprovals);
router.put('/approve/:id', idParamValidation, handleValidationErrors, adminController.approveRegistration);

// Audit log
router.get('/audit-log', adminController.getAuditLog);

// Notifications (available to all authenticated users via separate route)
module.exports = router;
