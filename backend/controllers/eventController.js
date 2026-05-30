const Event = require('../models/Event');
const Student = require('../models/Student');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('registeredStudents.student', 'name email studentId');

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
    const event = await Event.findById(req.params.id).populate('registeredStudents.student', 'name email studentId phone department');

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

    // Remove event reference from all students that registered for it
    await Student.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );

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

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Private
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      startDate: { $gte: new Date() },
      status: { $in: ['upcoming', 'ongoing'] },
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
    const filter = {};
    if (department) filter.department = department;
    if (section) filter.section = section;
    
    const events = await Event.find(filter).populate('registeredStudents.student', 'name email studentId');

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

    // Find the registered student entry
    const registeredStudent = event.registeredStudents.find(
      (rs) => rs.student.toString() === req.params.studentId
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
      message: error.message,
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

    // Find the registered student entry
    const registeredStudentIndex = event.registeredStudents.findIndex(
      (rs) => rs.student.toString() === req.params.studentId
    );

    if (registeredStudentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not registered for this event',
      });
    }

    // Update the payment status
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

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByFilter,
  updatePaymentStatus,
  checkPaymentStatus,
};