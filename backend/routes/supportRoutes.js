const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { protect, authorize } = require('../middleware/auth');

// @desc    Submit a support ticket
// @route   POST /api/support
// @access  Public (optionally authenticated)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please fill out all fields' });
        }

        // If authenticated, attach user ID
        let userId = null;
        if (req.headers.authorization) {
            try {
                const jwt = require('jsonwebtoken');
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Not fatal — treat as guest submission
            }
        }

        const ticket = await SupportTicket.create({
            user: userId,
            name,
            email,
            subject,
            message,
        });

        res.status(201).json({
            message: 'Support ticket submitted successfully! We will get back to you soon.',
            ticket: {
                id: ticket._id,
                subject: ticket.subject,
                status: ticket.status,
                createdAt: ticket.createdAt,
            },
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error submitting support ticket' });
    }
});

// @desc    Get all support tickets (Admin only)
// @route   GET /api/support
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const tickets = await SupportTicket.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email role');

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching support tickets' });
    }
});

// @desc    Mark a support ticket as resolved (Admin only)
// @route   PUT /api/support/:id/resolve
// @access  Private/Admin
router.put('/:id/resolve', protect, authorize('Admin'), async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { status: 'resolved' },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({ message: 'Ticket marked as resolved', ticket });
    } catch (error) {
        res.status(500).json({ message: 'Server error resolving ticket' });
    }
});

module.exports = router;
