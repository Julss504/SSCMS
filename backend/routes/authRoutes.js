const express = require('express');
const { register, registerStudent, login, getMe, getUsers, updateUserRole, createStudentUser, deleteUser, updateProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/register-student', registerStudent);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.get('/users', protect, authorize(['admin']), getUsers);
router.put('/users/:id/role', protect, authorize(['admin']), updateUserRole);
router.post('/create-student-user', protect, authorize(['admin']), createStudentUser);
router.delete('/users/:id', protect, authorize(['admin']), deleteUser);

module.exports = router;
