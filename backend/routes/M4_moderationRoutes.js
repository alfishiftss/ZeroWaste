const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const cloudinary = require('../config/cloudinary');
const { M1_protect, M1_authorize } = require('../middleware/M1_authMiddleware');

// ────────────────────────────────────────────────────────────
// All routes below require Admin authentication
// ────────────────────────────────────────────────────────────
router.use(M1_protect, M1_authorize('Admin'));

// @desc    Get ALL listings (regardless of status) for moderation
// @route   GET /api/moderation/listings
// @access  Private/Admin
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find()
            .sort({ createdAt: -1 })
            .populate('business', 'name email role');

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching listings for moderation' });
    }
});

// @desc    Force-delete a listing (admin moderation)
// @route   DELETE /api/moderation/listings/:id
// @access  Private/Admin
router.delete('/listings/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Clean up Cloudinary image if one was uploaded
        if (listing.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(listing.imagePublicId);
            } catch (cloudErr) {
                // Non-fatal — log but don't block deletion
                console.warn('Cloudinary cleanup failed:', cloudErr.message);
            }
        }

        await listing.deleteOne();

        res.json({
            message: 'Listing removed by admin',
            id: req.params.id,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting listing' });
    }
});

module.exports = router;
