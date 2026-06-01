const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
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

// Compound index to ensure one attendance record per student per event
attendanceSchema.index({ event: 1, student: 1 }, { unique: true });

// Static method to find only active (non-archived) attendance records
attendanceSchema.statics.findActive = function () {
  return this.find({ isArchived: { $ne: true } });
};

// Instance method to archive an attendance record
attendanceSchema.methods.archive = async function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  return await this.save();
};

// Instance method to restore an attendance record from archive
attendanceSchema.methods.restore = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  return await this.save();
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
