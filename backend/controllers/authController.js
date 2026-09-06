const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Helper — generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Create user (password is hashed via pre-save hook)
        const user = await User.create({ name, email, password, role });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Update user profile (name, email, phone)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if new email is already taken by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email is already in use by another account' });
            }
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        // Generate new token with updated info
        const token = generateToken(user);

        res.json({
            message: 'Profile updated successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Upload/update profile picture
// @route   PUT /api/auth/profile/picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if it exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save the relative path
        user.profilePicture = `/uploads/profiles/${req.file.filename}`;
        await user.save();

        // Generate new token with updated info
        const token = generateToken(user);

        res.json({
            message: 'Profile picture updated successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error uploading picture' });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Set new password (hashed via pre-save hook)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error changing password' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Request a password reset code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide your email address' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Don't reveal whether the email exists
            return res.json({
                message: 'If an account with that email exists, a reset code has been sent.',
            });
        }

        // Generate 6-digit reset code
        const resetCode = String(Math.floor(100000 + Math.random() * 900000));

        // Store code with 15-minute expiry
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // In production, send this via email. For demo, return in response.
        res.json({
            message: 'If an account with that email exists, a reset code has been sent.',
            // Demo only — remove in production
            _demoCode: resetCode,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error processing password reset request' });
    }
};

// @desc    Reset password using the code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, code, and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        // Set new password (hashed via pre-save hook)
        user.password = newPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error resetting password' });
    }
};

module.exports = { register, login, getMyProfile, updateProfile, uploadProfilePicture, changePassword, getAllUsers, forgotPassword, resetPassword };
