const Listing = require('../models/Listing');

const populateListing = (query) => query.populate('business', 'name email role');

const createListing = async (req, res) => {
    try {
        const { title, description, quantity, foodType, expiryTime } = req.body;

        const parsedQuantity = Number(quantity);
        const parsedExpiryTime = new Date(expiryTime);

        if (!title || !description || !quantity || !foodType || !expiryTime) {
            return res.status(400).json({ message: 'Please fill out all listing fields' });
        }

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a whole number greater than zero' });
        }

        if (Number.isNaN(parsedExpiryTime.getTime())) {
            return res.status(400).json({ message: 'Please provide a valid expiry time' });
        }

        if (parsedExpiryTime <= new Date()) {
            return res.status(400).json({ message: 'Expiry time must be in the future' });
        }

        const listing = await Listing.create({
            business: req.user.id,
            title,
            description,
            quantity: parsedQuantity,
            foodType,
            expiryTime: parsedExpiryTime,
        });

        const populatedListing = await populateListing(listing);

        res.status(201).json({
            message: 'Listing created successfully',
            listing: populatedListing,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating listing' });
    }
};

const getMyListings = async (req, res) => {
    try {
        const listings = await Listing.find({ business: req.user.id })
            .sort({ createdAt: -1 })
            .populate('business', 'name email role');

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};

module.exports = { createListing, getMyListings };
