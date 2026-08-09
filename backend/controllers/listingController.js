const Listing = require('../models/Listing');

// @desc    Create a new food listing
// @route   POST /api/listings
// @access  Private (Business / Admin)
const createListing = async (req, res) => {
    try {
        const { title, description, quantity, foodType, expiryTime } = req.body;

        const listing = await Listing.create({
            title,
            description,
            quantity,
            foodType,
            expiryTime,
            businessId: req.user.id, // from JWT middleware
        });

        res.status(201).json({ message: 'Listing created successfully', listing });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating listing' });
    }
};

// @desc    Get all active food listings
// @route   GET /api/listings
// @access  Public
const getAllListings = async (req, res) => {
    try {
        const listings = await Listing.find({ status: 'Active' })
            .populate('businessId', 'name email')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};

module.exports = { createListing, getAllListings };
