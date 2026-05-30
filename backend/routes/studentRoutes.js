const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  registerForEvent,
  importStudents,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream'
  ];
  
  if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.route('/').get(protect, authorize(['admin']), getStudents).post(protect, authorize(['admin']), createStudent);

router
  .route('/:id')
  .get(protect, authorize(['admin']), getStudent)
  .put(protect, authorize(['admin']), updateStudent)
  .delete(protect, authorize(['admin']), deleteStudent);

router.post('/:id/register/:eventId', protect, authorize(['admin']), registerForEvent);

// Import students route
router.post('/import', protect, authorize(['admin']), upload.single('file'), importStudents);

module.exports = router;
