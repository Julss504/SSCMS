const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  USN: {
    type: String,
    required: [true, 'Please provide a USN'],
    unique: true,
    trim: true,
    match: [/^\d{11}$/, 'USN must be exactly 11 digits'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{11}$/, 'Phone number must be exactly 11 digits'],
  },
  department: {
    type: String,
    trim: true,
    enum: ['Business Department', 'Information Technology Dept.', 'Hospitality Management Dept.', 'Education Dept.'],
  },
  year: {
    type: String,
    trim: true,
  },
  section: {
    type: String,
    trim: true,
  },
registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
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

// Static method to find only active (non-archived) students
studentSchema.statics.findActive = function () {
  return this.find({ isArchived: { $ne: true } });
};

// Instance method to archive a student
studentSchema.methods.archive = async function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  return await this.save();
};

// Instance method to restore a student from archive
studentSchema.methods.restore = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  return await this.save();
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
