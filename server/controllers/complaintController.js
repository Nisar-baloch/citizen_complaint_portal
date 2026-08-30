const { Parser } = require('json2csv');
const Complaint = require('../models/Complaint');

// Helper function to calculate Priority Score and Badge
const calculatePriority = (complaint) => {
  const upvotes = complaint.upvotes || 0;
  const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : new Date();
  const diffTime = Math.abs(new Date() - createdAt);
  const daysSinceCreated = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const priorityScore = upvotes * 2 + daysSinceCreated;

  let priorityBadge = 'Low';
  if (priorityScore >= 5 && priorityScore <= 15) {
    priorityBadge = 'Medium';
  } else if (priorityScore >= 16 && priorityScore <= 30) {
    priorityBadge = 'High';
  } else if (priorityScore > 30) {
    priorityBadge = 'Critical';
  }

  const complaintObj = complaint.toObject ? complaint.toObject() : { ...complaint };
  return {
    ...complaintObj,
    priorityScore,
    priorityBadge
  };
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen/Protected)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, area, imageUrl } = req.body;

    if (!title || !description || !category || !area) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, description, category, and area'
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      area,
      imageUrl: imageUrl || '',
      createdBy: req.user._id,
      status: 'Pending',
      feedbackPending: false,
      feedbackGiven: false
    });

    const responseData = calculatePriority(complaint);
    return res.status(201).json(responseData);
  } catch (error) {
    console.error('Create Complaint Error:', error.message);
    return res.status(500).json({ message: 'Server error creating complaint', error: error.message });
  }
};

// @desc    Get complaints (with dynamic search, filtering & duplicate check support)
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res) => {
  try {
    const { search, category, status, area } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (area) {
      query.area = area.toLowerCase().trim();
    }

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((c) => calculatePriority(c));
    return res.status(200).json(formattedComplaints);
  } catch (error) {
    console.error('Get Complaints Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching complaints', error: error.message });
  }
};

// @desc    Get logged in user's complaints
// @route   GET /api/complaints/mine
// @access  Private (Citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((c) => calculatePriority(c));
    return res.status(200).json(formattedComplaints);
  } catch (error) {
    console.error('Get My Complaints Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching user complaints', error: error.message });
  }
};

// @desc    Export complaints as CSV
// @route   GET /api/complaints/export
// @access  Private (Officer only)
const exportComplaintsCSV = async (req, res) => {
  try {
    const { category, status, area } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (area) {
      query.area = area.toLowerCase().trim();
    }

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const dataToExport = complaints.map((c) => {
      const withPriority = calculatePriority(c);
      return {
        ID: c._id.toString(),
        Title: c.title,
        Category: c.category,
        Area: c.area,
        Status: c.status,
        Priority: withPriority.priorityBadge,
        Upvotes: c.upvotes || 0,
        'Filed By': c.createdBy ? c.createdBy.name : 'Unknown',
        'Filed On': c.createdAt ? new Date(c.createdAt).toISOString() : '',
        'Last Updated': c.updatedAt ? new Date(c.updatedAt).toISOString() : '',
        'Officer Remark': c.officerRemark || ''
      };
    });

    const fields = [
      'ID',
      'Title',
      'Category',
      'Area',
      'Status',
      'Priority',
      'Upvotes',
      'Filed By',
      'Filed On',
      'Last Updated',
      'Officer Remark'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(dataToExport);

    const todayDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="complaints_export_${todayDate}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV Error:', error.message);
    return res.status(500).json({ message: 'Server error exporting complaints CSV', error: error.message });
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Public
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const formattedComplaint = calculatePriority(complaint);
    return res.status(200).json(formattedComplaint);
  } catch (error) {
    console.error('Get Complaint By ID Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    return res.status(500).json({ message: 'Server error fetching complaint', error: error.message });
  }
};

// @desc    Upvote a complaint
// @route   PATCH /api/complaints/:id/upvote
// @access  Private (Citizen)
const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user has already upvoted
    const alreadyUpvoted = complaint.upvotedBy.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyUpvoted) {
      return res.status(400).json({ message: 'You have already upvoted this complaint' });
    }

    complaint.upvotedBy.push(req.user._id);
    complaint.upvotes += 1;
    await complaint.save();

    const formattedComplaint = calculatePriority(complaint);
    return res.status(200).json(formattedComplaint);
  } catch (error) {
    console.error('Upvote Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    return res.status(500).json({ message: 'Server error upvoting complaint', error: error.message });
  }
};

// @desc    Update complaint status & officer remark
// @route   PATCH /api/complaints/:id/status
// @access  Private (Officer only)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, officerRemark } = req.body;

    if (!status || !['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status (Pending, In Progress, Resolved)' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (officerRemark !== undefined) {
      complaint.officerRemark = officerRemark;
    }

    if (status === 'Resolved') {
      complaint.feedbackPending = true;
    }

    await complaint.save();

    const formattedComplaint = calculatePriority(complaint);
    return res.status(200).json(formattedComplaint);
  } catch (error) {
    console.error('Update Status Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    return res.status(500).json({ message: 'Server error updating complaint status', error: error.message });
  }
};

// @desc    Submit feedback for resolved complaint
// @route   PATCH /api/complaints/:id/feedback
// @access  Private (Citizen owner only)
const submitComplaintFeedback = async (req, res) => {
  try {
    const { rating, feedbackComment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify ownership
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit feedback for this complaint' });
    }

    complaint.feedbackRating = Number(rating);
    complaint.feedbackComment = feedbackComment || '';
    complaint.feedbackGiven = true;
    complaint.feedbackPending = false;

    await complaint.save();

    const formattedComplaint = calculatePriority(complaint);
    return res.status(200).json(formattedComplaint);
  } catch (error) {
    console.error('Submit Feedback Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    return res.status(500).json({ message: 'Server error submitting feedback', error: error.message });
  }
};

module.exports = {
  calculatePriority,
  createComplaint,
  getComplaints,
  getMyComplaints,
  exportComplaintsCSV,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitComplaintFeedback
};
