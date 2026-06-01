const Student = require('../models/Student');
const Event = require('../models/Event');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
// @query   archived - Set to 'true' to include archived students, 'false' for active only (default)
const getStudents = async (req, res) => {
  try {
    const archivedFilter = req.query.archived;
    let query = {};

    if (archivedFilter === 'true') {
      query = {};
    } else if (archivedFilter === 'false' || archivedFilter === undefined) {
      query = { isArchived: { $ne: true } };
    }

    const students = await Student.find(query).populate('registeredEvents', 'title date');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('registeredEvents', 'title date location');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
const { USN, name, email, phone, department, year, section } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ $or: [{ USN }, { email }] });

    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: 'Student with this USN or email already exists',
      });
    }

    const student = await Student.create({
      USN,
      name,
      email,
      phone,
      department,
      year,
      section,
    });

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    await student.deleteOne();

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

// @desc    Archive student
// @route   PATCH /api/students/:id/archive
// @access  Private
const archiveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (student.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Student is already archived',
      });
    }

    await student.archive();

    res.status(200).json({
      success: true,
      message: 'Student archived successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Restore archived student
// @route   PATCH /api/students/:id/restore
// @access  Private
const restoreStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!student.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Student is not archived',
      });
    }

    await student.restore();

    res.status(200).json({
      success: true,
      message: 'Student restored successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register student for event
// @route   POST /api/students/:id/register/:eventId
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const event = await Event.findById(req.params.eventId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const alreadyRegistered = event.registeredStudents.some(
      (reg) => reg.student.toString() === student._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Student already registered for this event',
      });
    }

    event.registeredStudents.push({
      student: student._id,
      paymentStatus: event.requiresPayment ? 'pending' : 'not_required',
      approvalStatus: 'pending',
    });

    await event.save();

    student.registeredEvents.push(event._id);
    await student.save();

    res.status(200).json({
      success: true,
      data: { student, event },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const registerSelfForEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const studentId = req.user.studentRef;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not linked to this account',
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const alreadyRegistered = event.registeredStudents.some(
      (reg) => reg.student.toString() === studentId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    event.registeredStudents.push({
      student: studentId,
      paymentStatus: event.requiresPayment ? 'pending' : 'not_required',
      approvalStatus: 'pending',
    });

    await event.save();

    const student = await Student.findById(studentId);
    if (student && !student.registeredEvents.includes(event._id)) {
      student.registeredEvents.push(event._id);
      await student.save();
    }

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Import students from XLSX file
// @route   POST /api/students/import
// @access  Private
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an XLSX file'
      });
    }

    // Read XLSX file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate and process students
    const students = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
       const studentData = {
         USN: row['Student ID'] || row['studentId'] || row['id'] || row['USN'],
         name: row['Name'] || row['name'],
         email: row['Email'] || row['email'],
         phone: row['Phone'] || row['phone'] || '',
         department: row['Department'] || row['department'] || '',
         year: row['Year'] || row['year'] || '',
         section: row['Section'] || row['section'] || ''
       };

       // Basic validation
       if (!studentData.USN || !studentData.name || !studentData.email) {
         errors.push(`Row ${i + 2}: Missing required fields (USN, Name, or Email)`);
         continue;
       }

       // Check if student exists
       const existingStudent = await Student.findOne({ 
         $or: [
           { USN: studentData.USN }, 
           { email: studentData.email }
         ]
       });

      if (existingStudent) {
         errors.push(`Row ${i + 2}: Student with USN ${studentData.USN} or email ${studentData.email} already exists`);
        continue;
      }

      students.push(studentData);
    }

    // Create students
    if (students.length > 0) {
      await Student.insertMany(students);
    }

    res.status(200).json({
      success: true,
      message: `Successfully imported ${students.length} students. ${errors.length} errors found.`,
      data: {
        imported: students.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  registerForEvent,
  registerSelfForEvent,
  importStudents,
  archiveStudent,
  restoreStudent,
};
