const Event = require('../models/Event');
const Student = require('../models/Student');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
// @query   archived - Set to 'true' to include archived events, 'false' for active only (default)
const getEvents = async (req, res) => {
  try {
    const archivedFilter = req.query.archived;
    let query = {};

    if (archivedFilter === 'true') {
      query = {};
    } else if (archivedFilter === 'false' || archivedFilter === undefined) {
      query = { isArchived: { $ne: true } };
    }

    const events = await Event.find(query).populate('registeredStudents.student', 'name email USN');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('registeredStudents.student', 'name email USN phone department');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, time, location, requiresPayment, paymentAmount, department, section } = req.body;

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      time,
      location,
      requiresPayment,
      paymentAmount: requiresPayment ? paymentAmount : 0,
      department: department || 'Business Department',
      section: section || '',
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.deleteOne();

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

// @desc    Archive event
// @route   PATCH /api/events/:id/archive
// @access  Private
const archiveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Event is already archived',
      });
    }

    await event.archive();

    res.status(200).json({
      success: true,
      message: 'Event archived successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Restore archived event
// @route   PATCH /api/events/:id/restore
// @access  Private
const restoreEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Event is not archived',
      });
    }

    await event.restore();

    res.status(200).json({
      success: true,
      message: 'Event restored successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      startDate: { $gte: new Date() },
      status: { $in: ['upcoming', 'ongoing'] },
      isArchived: { $ne: true },
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get events by department and/or section
// @route   GET /api/events/filter
// @access  Private
const getEventsByFilter = async (req, res) => {
  try {
    const { department, section } = req.query;
    
    // Build filter object
    const filter = { isArchived: { $ne: true } };
    if (department) filter.department = department;
    if (section) filter.section = section;
    
    const events = await Event.find(filter).populate('registeredStudents.student', 'name email USN');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check payment status for a student for an event
// @route   GET /api/events/:id/payment-check/:studentId
// @access  Private
const checkPaymentStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN: req.params.studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Find the registered student entry
    const registeredStudent = event.registeredStudents.find(
      (rs) => rs.student.toString() === student._id.toString()
    );

    if (!registeredStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not registered for this event',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        studentId: req.params.studentId,
        eventId: req.params.id,
        paymentStatus: registeredStudent.paymentStatus,
        isPaid: registeredStudent.paymentStatus === 'paid',
        requiresPayment: event.requiresPayment,
        paymentAmount: event.requiresPayment ? event.paymentAmount : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN: req.params.studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const registeredStudentIndex = event.registeredStudents.findIndex(
      (rs) => rs.student.toString() === student._id.toString()
    );

    if (registeredStudentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not registered for this event',
      });
    }

    event.registeredStudents[registeredStudentIndex].paymentStatus = req.body.paymentStatus;
    await event.save();

    res.status(200).json({
      success: true,
      data: event.registeredStudents[registeredStudentIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN: req.params.studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const registeredStudentIndex = event.registeredStudents.findIndex(
      (rs) => rs.student.toString() === student._id.toString()
    );

    if (registeredStudentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not registered for this event',
      });
    }

    event.registeredStudents[registeredStudentIndex].approvalStatus = 'approved';
    event.registeredStudents[registeredStudentIndex].approvedBy = req.user._id;
    event.registeredStudents[registeredStudentIndex].approvedAt = new Date();
    await event.save();

    res.status(200).json({
      success: true,
      data: event.registeredStudents[registeredStudentIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const disapproveRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN: req.params.studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const registeredStudentIndex = event.registeredStudents.findIndex(
      (rs) => rs.student.toString() === student._id.toString()
    );

    if (registeredStudentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not registered for this event',
      });
    }

    event.registeredStudents[registeredStudentIndex].approvalStatus = 'disapproved';
    event.registeredStudents[registeredStudentIndex].approvedBy = req.user._id;
    event.registeredStudents[registeredStudentIndex].approvedAt = new Date();
    await event.save();

    res.status(200).json({
      success: true,
      data: event.registeredStudents[registeredStudentIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  archiveEvent,
  restoreEvent,
  getUpcomingEvents,
  getEventsByFilter,
  updatePaymentStatus,
  checkPaymentStatus,
  approveRegistration,
  disapproveRegistration,
};