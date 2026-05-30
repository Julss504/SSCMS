const express = require('express');
const { register, login, getMe, getUsers, deleteUser, updateProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.get('/users', protect, authorize(['admin']), getUsers);
router.delete('/users/:id', protect, authorize(['admin']), deleteUser);

module.exports = router;
