const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

// Routes for collections
router.route('/')
  .post(createApplication)
  .get(getApplications);

// Route for specific status update workflow
router.route('/:id/status')
  .patch(updateApplicationStatus);

// Routes for single application resource
router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
