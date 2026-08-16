const express = require('express');
const router = express.Router();
const { register, login, getMyProfile, updateProfile, uploadProfilePicture, changePassword, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private routes — any authenticated user
router.get('/me', protect, getMyProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.put('/change-password', protect, changePassword);

// Admin-only route
router.get('/users', protect, authorize('Admin'), getAllUsers);

module.exports = router;
