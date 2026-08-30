const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Road', 'Garbage', 'Water', 'Electricity', 'Other'],
        message: '{VALUE} is not a valid category'
      }
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      lowercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Pending'
    },
    upvotes: {
      type: Number,
      default: 0
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    imageUrl: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User ID is required']
    },
    officerRemark: {
      type: String,
      default: ''
    },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackComment: {
      type: String,
      default: ''
    },
    feedbackGiven: {
      type: Boolean,
      default: false
    },
    feedbackPending: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
