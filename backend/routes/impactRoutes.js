const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Get public impact statistics
// @route   GET /api/impact/stats
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const mealsSaved = await Listing.countDocuments({
            status: 'completed',
        });

        const totalListings = await Listing.countDocuments();

        const activeDonors = await Listing.distinct('business').then(
            (ids) => ids.length
        );

        res.json({ mealsSaved, totalListings, activeDonors });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching impact stats' });
    }
});

module.exports = router;
