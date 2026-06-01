const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide an event start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an event end date'],
  },
  time: {
    type: String,
    required: [true, 'Please provide an event time'],
  },
  location: {
    type: String,
    required: [true, 'Please provide an event location'],
    trim: true,
  },
  department: {
    type: String,
    required: false,
    trim: true,
    enum: ['Business Department', 'Information Technology Dept.', 'Hospitality Management Dept.', 'Education Dept.'],
    default: 'Business Department',
  },
  section: {
    type: String,
    required: false,
    trim: true,
  },
  requiresPayment: {
    type: Boolean,
    default: false,
  },
  paymentAmount: {
    type: Number,
    default: 0,
  },
  registeredStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'not_required'],
      default: 'not_required',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'disapproved'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to find only active (non-archived) events
eventSchema.statics.findActive = function () {
  return this.find({ isArchived: { $ne: true } });
};

// Instance method to archive an event
eventSchema.methods.archive = async function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  return await this.save();
};

// Instance method to restore an event from archive
eventSchema.methods.restore = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  return await this.save();
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
