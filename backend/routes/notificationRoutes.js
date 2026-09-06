const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate('relatedListing', 'title status');

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            read: false,
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating notification' });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating notifications' });
    }
});

module.exports = router;
