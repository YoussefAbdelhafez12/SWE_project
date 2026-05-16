const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { idParamValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/helpers');
const managerController = require('../controllers/manager.controller');

// All routes require FM role
router.use(authenticate, authorize('facility_manager', 'admin'));

router.get('/workers', managerController.getWorkers);
router.put('/workers/:id/status', idParamValidation, handleValidationErrors, managerController.updateWorkerStatus);

module.exports = router;
