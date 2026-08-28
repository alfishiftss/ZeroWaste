const Claim = require('../models/Claim');
const Listing = require('../models/Listing');

// Generate a random 4 digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const createClaim = async (req, res) => {
    try {
        const { listingId } = req.body;
        const consumerId = req.user.id; // from auth middleware

        if (!listingId) {
            return res.status(400).json({ message: 'Listing ID is required' });
        }

        // Find the listing
        const listing = await Listing.findById(listingId);
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.status !== 'active') {
            return res.status(400).json({ message: 'Listing is not active' });
        }

        if (listing.quantity < 1) {
            return res.status(400).json({ message: 'Listing is out of stock' });
        }

        // Decrement quantity
        listing.quantity -= 1;
        
        // If quantity is now 0, update status to claimed
        if (listing.quantity === 0) {
            listing.status = 'claimed';
        }
        
        await listing.save();

        // Generate OTP and create Claim
        const otp = generateOTP();
        const claim = new Claim({
            consumer: consumerId,
            listing: listingId,
            otp,
            status: 'Pending'
        });

        await claim.save();

        res.status(201).json({
            message: 'Claim created successfully',
            claim
        });
    } catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ message: 'Server error creating claim' });
    }
};

const getConsumerClaims = async (req, res) => {
    try {
        const consumerId = req.user.id;
        
        const claims = await Claim.find({ consumer: consumerId })
            .populate('listing')
            .sort({ createdAt: -1 });
            
        res.status(200).json(claims);
    } catch (error) {
        console.error('Error fetching claims:', error);
        res.status(500).json({ message: 'Server error fetching claims' });
    }
};

module.exports = {
    createClaim,
    getConsumerClaims
};
