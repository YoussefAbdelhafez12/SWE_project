const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { idParamValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/helpers');
const adminController = require('../controllers/admin.controller');

// All notification routes require authentication
router.use(authenticate);

router.get('/', adminController.getNotifications);
router.put('/:id/read', idParamValidation, handleValidationErrors, adminController.markNotificationRead);
router.put('/read-all', adminController.markAllNotificationsRead);

module.exports = router;
