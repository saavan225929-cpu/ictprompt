const mongoose = require('mongoose');

// Subdocument schema for recording each status change in the application lifecycle
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Applied', 'Interview', 'Offer', 'Accepted', 'Declined', 'Rejected']
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Main Job Application Schema
const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: [true, 'Application ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [100, 'Job role cannot exceed 100 characters']
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: ['Full-time', 'Internship', 'Contract'],
        message: '{VALUE} is not a valid job type. Must be Full-time, Internship, or Contract'
      }
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required']
    },
    expectedSalary: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Interview', 'Offer', 'Accepted', 'Declined', 'Rejected'],
        message: '{VALUE} is not a valid application status'
      },
      default: 'Applied'
    },
    followUpDate: {
      type: Date,
      required: [true, 'Follow-up date is required']
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Virtual field: isOverdue
 * Returns true if status is "Applied" and the current date is past the followUpDate.
 * Otherwise returns false.
 */
applicationSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'Applied') {
    return false;
  }
  if (!this.followUpDate) {
    return false;
  }
  return new Date() > new Date(this.followUpDate);
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
