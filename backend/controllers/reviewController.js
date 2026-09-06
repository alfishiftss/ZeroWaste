const Review = require('../models/Review');
const Listing = require('../models/Listing');

// @desc    Create a new review for a completed pickup
// @route   POST /api/reviews
// @access  Private/Consumer
const createReview = async (req, res) => {
    try {
        const { listingId, rating, reviewText } = req.body;

        if (!listingId || !rating) {
            return res.status(400).json({ message: 'Listing ID and rating are required' });
        }

        const parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
        }

        // Find the listing
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if status is completed
        if (listing.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed pickups' });
        }

        // Check if the current user claimed this listing
        if (listing.claimedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only review listings you have claimed' });
        }

        // Check if a review already exists
        const existingReview = await Review.findOne({
            user: req.user.id,
            listing: listingId,
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this pickup' });
        }

        // Create the review
        const review = await Review.create({
            user: req.user.id,
            business: listing.business,
            listing: listingId,
            rating: parsedRating,
            reviewText: reviewText || '',
        });

        const populatedReview = await review.populate('user', 'name profilePicture');

        res.status(201).json({
            message: 'Review submitted successfully',
            review: populatedReview,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error creating review' });
    }
};

// @desc    Get all reviews for a specific business
// @route   GET /api/reviews/business/:businessId
// @access  Public
const getBusinessReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ business: req.params.businessId })
            .sort({ createdAt: -1 })
            .populate('user', 'name profilePicture');
        
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};

module.exports = { createReview, getBusinessReviews };
