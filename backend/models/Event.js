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
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
