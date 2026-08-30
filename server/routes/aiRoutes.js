const express = require('express');
const router = express.Router();
const { protect, officerOnly } = require('../middleware/authMiddleware');
const { getOfficerBriefing } = require('../controllers/aiController');

// @route   POST /api/ai/officer-summary
// @desc    Generate AI Daily Briefing for officers (Protected - Officer only)
router.post('/officer-summary', protect, officerOnly, getOfficerBriefing);

module.exports = router;
