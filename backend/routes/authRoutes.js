const express = require('express');
const router = express.Router();
const { register, login, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin-only route
router.get('/users', protect, authorize('Admin'), getAllUsers);

module.exports = router;
