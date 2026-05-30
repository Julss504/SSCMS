const Student = require('../models/Student');
const Event = require('../models/Event');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('registeredEvents', 'title date');

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
    const { studentId, name, email, phone, department, year, section } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ $or: [{ studentId }, { email }] });

    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: 'Student with this ID or email already exists',
      });
    }

    const student = await Student.create({
      studentId,
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

    // Check if already registered
    const alreadyRegistered = event.registeredStudents.some(
      (reg) => reg.student.toString() === student._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Student already registered for this event',
      });
    }



    // Add student to event
    event.registeredStudents.push({
      student: student._id,
      paymentStatus: event.requiresPayment ? 'pending' : 'not_required',
    });

    await event.save();

    // Add event to student
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
        studentId: row['Student ID'] || row['studentId'] || row['id'],
        name: row['Name'] || row['name'],
        email: row['Email'] || row['email'],
        phone: row['Phone'] || row['phone'] || '',
        department: row['Department'] || row['department'] || '',
        year: row['Year'] || row['year'] || '',
        section: row['Section'] || row['section'] || ''
      };

      // Basic validation
      if (!studentData.studentId || !studentData.name || !studentData.email) {
        errors.push(`Row ${i + 2}: Missing required fields (Student ID, Name, or Email)`);
        continue;
      }

      // Check if student exists
      const existingStudent = await Student.findOne({ 
        $or: [
          { studentId: studentData.studentId }, 
          { email: studentData.email }
        ]
      });

      if (existingStudent) {
        errors.push(`Row ${i + 2}: Student with ID ${studentData.studentId} or email ${studentData.email} already exists`);
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
  importStudents
};
