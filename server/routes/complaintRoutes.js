const express = require('express');
const router = express.Router();
const { protect, officerOnly } = require('../middleware/authMiddleware');
const {
  createComplaint,
  getComplaints,
  getMyComplaints,
  exportComplaintsCSV,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitComplaintFeedback
} = require('../controllers/complaintController');

// @route   POST /api/complaints
// @desc    Create complaint (Protected)
router.post('/', protect, createComplaint);

// @route   GET /api/complaints
// @desc    Get all complaints / query complaints (Public)
router.get('/', getComplaints);

// @route   GET /api/complaints/mine
// @desc    Get logged in user's complaints (Protected)
router.get('/mine', protect, getMyComplaints);

// @route   GET /api/complaints/export
// @desc    Export complaints as CSV (Protected - Officer only)
router.get('/export', protect, officerOnly, exportComplaintsCSV);

// @route   GET /api/complaints/:id
// @desc    Get single complaint by ID (Public)
router.get('/:id', getComplaintById);

// @route   PATCH /api/complaints/:id/upvote
// @desc    Upvote complaint (Protected - Citizen)
router.patch('/:id/upvote', protect, upvoteComplaint);

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status & officer remark (Protected - Officer only)
router.patch('/:id/status', protect, officerOnly, updateComplaintStatus);

// @route   PATCH /api/complaints/:id/feedback
// @desc    Submit feedback for resolved complaint (Protected - Citizen owner only)
router.patch('/:id/feedback', protect, submitComplaintFeedback);

module.exports = router;
