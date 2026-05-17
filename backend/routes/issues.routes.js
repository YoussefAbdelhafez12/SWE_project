const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { issueValidation, statusUpdateValidation, assignValidation, commentValidation, idParamValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/helpers');
const issuesController = require('../controllers/issues.controller');

// Multer config for issue photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Categories (all authenticated users)
router.get('/categories', issuesController.getCategories);

// Statistics (FM + Admin)
router.get('/stats', authorize('facility_manager', 'admin'), issuesController.getIssueStats);

// Community Member routes
router.post('/', authorize('community_member'), upload.single('photo'), issueValidation, handleValidationErrors, issuesController.createIssue);
router.get('/my', authorize('community_member'), issuesController.getMyIssues);

// Worker routes
router.get('/assigned', authorize('worker'), issuesController.getAssignedIssues);
router.get('/worker-history', authorize('worker'), issuesController.getWorkerHistory);

// FM + Admin: Get all issues
router.get('/', authorize('facility_manager', 'admin'), issuesController.getAllIssues);

// Issue detail (all authenticated)
router.get('/:id', idParamValidation, handleValidationErrors, issuesController.getIssueById);

// Status update (FM + Worker + Admin)
router.put('/:id/status', authorize('facility_manager', 'worker', 'admin'), idParamValidation, statusUpdateValidation, handleValidationErrors, issuesController.updateIssueStatus);

// Assignment (FM + Admin)
router.put('/:id/assign', authorize('facility_manager', 'admin'), idParamValidation, assignValidation, handleValidationErrors, issuesController.assignIssue);

// Close issue (FM + Admin)
router.put('/:id/close', authorize('facility_manager', 'admin'), idParamValidation, issuesController.closeIssue);

// Comments (Worker + FM + Admin)
router.post('/:id/comments', authorize('worker', 'facility_manager', 'admin'), idParamValidation, commentValidation, handleValidationErrors, issuesController.addComment);

// Photo upload (Worker + Community Member)
router.post('/:id/photo', authorize('worker', 'community_member'), upload.single('photo'), idParamValidation, issuesController.uploadIssuePhoto);

// Delete issue (FM + Admin)
router.delete('/:id', authorize('facility_manager', 'admin'), idParamValidation, handleValidationErrors, issuesController.deleteIssue);

module.exports = router;
