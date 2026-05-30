const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Student = require('../models/Student');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendanceRecords = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('event', 'title date location')
      .populate('student', 'name studentId email department year section');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get attendance by event
// @route   GET /api/attendance/event/:eventId
// @access  Private
const getAttendanceByEvent = async (req, res) => {
  try {
    const attendance = await Attendance.find({ event: req.params.eventId })
      .populate('student', 'name studentId email department year section');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getAttendanceByStudent = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId })
      .populate('event', 'title date location');

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
  try {
    const { eventId, studentId, status, notes } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const isRegistered = event.registeredStudents.some(
      (reg) => reg.student.toString() === studentId
    );

    if (!isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Student is not registered for this event',
      });
    }

    const existingAttendance = await Attendance.findOne({
      event: eventId,
      student: studentId,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student',
      });
    }

    const attendance = await Attendance.create({
      event: eventId,
      student: studentId,
      status: status || 'present',
      notes,
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('event', 'title date location')
      .populate('student', 'name studentId email department year section');

    res.status(201).json({
      success: true,
      data: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update attendance by event and student
// @route   PUT /api/attendance/event/:eventId/student/:studentId
// @access  Private
const updateAttendanceByEventAndStudent = async (req, res) => {
  try {
    const { eventId, studentId } = req.params;
    
    let attendance = await Attendance.findOne({
      event: eventId,
      student: studentId
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    attendance = await Attendance.findOneAndUpdate(
      { event: eventId, student: studentId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('event', 'title date location')
      .populate('student', 'name studentId email department year section');

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private
const updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('event', 'title date location')
      .populate('student', 'name studentId email department year section');

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAttendanceRecords,
  getAttendanceByEvent,
  getAttendanceByStudent,
  markAttendance,
  updateAttendance,
  updateAttendanceByEventAndStudent,
  deleteAttendance
};

