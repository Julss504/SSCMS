const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register admin or officer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'officer' } = req.body;
    const normalizedEmail = email.toLowerCase();

    if (!['admin', 'officer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Register student (creates Student + User)
// @route   POST /api/auth/register-student
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { USN, name, email, password, phone, department, year, section } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const existingStudent = await Student.findOne({
      $or: [{ USN }, { email: normalizedEmail }]
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this USN or email already exists',
      });
    }

    const student = await Student.create({
      USN,
      name,
      email: normalizedEmail,
      phone,
      department,
      year,
      section,
    });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'student',
      studentRef: student._id,
    });

     res.status(201).json({
       success: true,
       data: {
         _id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         studentId: student.USN,
         token: generateToken(user._id, user.role),
       },
     });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user (admin, officer, or student)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Please try again later.',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    await user.resetLoginAttempts();

    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };

     if (user.role === 'student' && user.studentRef) {
       const student = await Student.findById(user.studentRef);
       responseData.studentId = student?.USN;
       responseData.studentRef = user.studentRef;
     }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('studentRef', 'studentId name email');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['admin', 'officer', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create user account for existing student (admin only)
// @route   POST /api/auth/create-student-user
// @access  Private/Admin
const createStudentUser = async (req, res) => {
  try {
    const { USN, password } = req.body;

    const student = await Student.findOne({ USN: USN });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: student.email }, { studentRef: student._id }]
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User account already exists for this student',
      });
    }

    const user = await User.create({
      name: student.name,
      email: student.email,
      password,
      role: 'student',
      studentRef: student._id,
    });

     res.status(201).json({
       success: true,
       data: {
         _id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         studentId: student.USN,
       },
     });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'student' && user.studentRef) {
      await Student.findByIdAndDelete(user.studentRef);
    }

    await user.deleteOne();

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

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (password) updates.password = password;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  registerStudent,
  login,
  getMe,
  getUsers,
  updateUserRole,
  createStudentUser,
  deleteUser,
  updateProfile
};
