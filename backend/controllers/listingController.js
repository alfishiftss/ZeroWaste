const Listing = require('../models/Listing');
const cloudinary = require('../config/cloudinary');

const populateListing = (query) => query.populate('business', 'name email role');

const deleteImage = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        // Non-fatal — an orphaned Cloudinary asset is not worth failing the request over
    }
};

const createListing = async (req, res) => {
    try {
        const { title, description, quantity, foodType, expiryTime, city, neighborhood } = req.body;

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
            city: city || '',
            neighborhood: neighborhood || '',
            imageUrl: req.file ? req.file.path : '',
            imagePublicId: req.file ? req.file.filename : '',
        });

        const populatedListing = await populateListing(listing);

        res.status(201).json({
            message: 'Listing created successfully',
            listing: populatedListing,
        });
    } catch (error) {
        if (req.file) await deleteImage(req.file.filename);
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

// @desc    Get listings claimed by the consumer
// @route   GET /api/listings/pickups
// @access  Private/Consumer
const getMyPickups = async (req, res) => {
    try {
        const listings = await Listing.find({ claimedBy: req.user.id })
            .sort({ updatedAt: -1 })
            .populate('business', 'name email role phone');

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pickups' });
    }
};

// @desc    Get active listings for the public feed — supports search + filters
// @route   GET /api/listings?q=&city=&foodType=&endingSoon=true
// @access  Public
const getAllListings = async (req, res) => {
    try {
        const { q, city, foodType, endingSoon } = req.query;

        const query = {
            status: 'active',
            expiryTime: { $gt: new Date() },
        };

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Independent OR-groups combined with AND, so text search and location
        // filter each narrow the results rather than widening them together.
        const andConditions = [];

        if (q && q.trim()) {
            const pattern = new RegExp(escapeRegex(q.trim()), 'i');
            andConditions.push({ $or: [{ title: pattern }, { description: pattern }] });
        }

        if (city && city.trim()) {
            const pattern = new RegExp(escapeRegex(city.trim()), 'i');
            andConditions.push({ $or: [{ city: pattern }, { neighborhood: pattern }] });
        }

        if (andConditions.length > 0) {
            query.$and = andConditions;
        }

        if (foodType && ['Veg', 'Non-Veg'].includes(foodType)) {
            query.foodType = foodType;
        }

        if (endingSoon === 'true') {
            const soonThreshold = new Date(Date.now() + 3 * 60 * 60 * 1000);
            query.expiryTime.$lte = soonThreshold;
        }

        const listings = await Listing.find(query)
            .sort({ expiryTime: 1 })
            .populate('business', 'name email role');

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};

// @desc    Update own listing
// @route   PUT /api/listings/:id
// @access  Private/Business (owner only)
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.business.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own listings' });
        }

        if (listing.status !== 'active') {
            return res.status(400).json({ message: 'Only active listings can be edited' });
        }

        const { title, description, quantity, foodType, expiryTime, city, neighborhood } = req.body;

        if (title !== undefined) listing.title = title;
        if (description !== undefined) listing.description = description;
        if (city !== undefined) listing.city = city;
        if (neighborhood !== undefined) listing.neighborhood = neighborhood;

        if (quantity !== undefined) {
            const parsedQuantity = Number(quantity);
            if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
                return res.status(400).json({ message: 'Quantity must be a whole number greater than zero' });
            }
            listing.quantity = parsedQuantity;
        }

        if (foodType !== undefined) listing.foodType = foodType;

        if (expiryTime !== undefined) {
            const parsedExpiryTime = new Date(expiryTime);
            if (Number.isNaN(parsedExpiryTime.getTime())) {
                return res.status(400).json({ message: 'Please provide a valid expiry time' });
            }
            if (parsedExpiryTime <= new Date()) {
                return res.status(400).json({ message: 'Expiry time must be in the future' });
            }
            listing.expiryTime = parsedExpiryTime;
        }

        if (req.file) {
            const oldPublicId = listing.imagePublicId;
            listing.imageUrl = req.file.path;
            listing.imagePublicId = req.file.filename;
            await deleteImage(oldPublicId);
        }

        await listing.save();

        const populatedListing = await populateListing(listing);

        res.json({
            message: 'Listing updated successfully',
            listing: populatedListing,
        });
    } catch (error) {
        if (req.file) await deleteImage(req.file.filename);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error updating listing' });
    }
};

// @desc    Delete own listing
// @route   DELETE /api/listings/:id
// @access  Private/Business (owner only)
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.business.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own listings' });
        }

        if (listing.status !== 'active') {
            return res.status(400).json({ message: 'Only active listings can be deleted' });
        }

        await deleteImage(listing.imagePublicId);
        await listing.deleteOne();

        res.json({ message: 'Listing deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting listing' });
    }
};

// @desc    Claim a listing (Consumer)
// @route   POST /api/listings/:id/claim
// @access  Private/Consumer
const claimListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('business', 'name email');

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.status !== 'active') {
            return res.status(400).json({ message: 'This listing is no longer available' });
        }

        if (new Date(listing.expiryTime) <= new Date()) {
            return res.status(400).json({ message: 'This listing has expired' });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Mark as claimed
        listing.status = 'claimed';
        listing.claimedBy = req.user.id;
        listing.claimOtp = otp;
        await listing.save();

        // Create notification for the business owner
        const Notification = require('../models/Notification');
        const User = require('../models/User');
        const consumer = await User.findById(req.user.id).select('name');

        await Notification.create({
            recipient: listing.business._id,
            type: 'claim',
            message: `${consumer?.name || 'A consumer'} claimed your listing "${listing.title}"`,
            relatedListing: listing._id,
        });

        const populatedListing = await populateListing(listing);

        res.json({
            message: 'Listing claimed successfully!',
            otp,
            listing: populatedListing,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error claiming listing' });
    }
};

// @desc    Verify OTP to complete listing (Business)
// @route   POST /api/listings/:id/verify-otp
// @access  Private/Business
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.business.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to verify this listing' });
        }

        if (listing.status !== 'claimed') {
            return res.status(400).json({ message: 'Listing is not in claimed state' });
        }

        if (!listing.claimOtp || listing.claimOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        // OTP matches -> Mark complete
        listing.status = 'completed';
        listing.claimOtp = null; // Clear the OTP for security
        await listing.save();

        // Notify consumer
        if (listing.claimedBy) {
            const Notification = require('../models/Notification');
            const User = require('../models/User');
            const businessUser = await User.findById(req.user.id).select('name');
            await Notification.create({
                recipient: listing.claimedBy,
                type: 'system',
                message: `${businessUser?.name || 'The business'} verified your pickup for "${listing.title}". Thank you for reducing waste!`,
                relatedListing: listing._id,
            });
        }

        const populatedListing = await populateListing(listing);
        res.json({
            message: 'OTP verified! Listing is now completed.',
            listing: populatedListing,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error verifying OTP' });
    }
};

module.exports = { createListing, getMyListings, getMyPickups, getAllListings, updateListing, deleteListing, claimListing, verifyOtp };
