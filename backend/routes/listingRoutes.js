const express = require('express');
const router = express.Router();
const {
    createListing,
    getMyListings,
    getMyPickups,
    getAllListings,
    updateListing,
    deleteListing,
    claimListing,
    verifyOtp,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const uploadListing = require('../middleware/uploadListing');

router.get('/', getAllListings);
router.post('/', protect, authorize('Business'), uploadListing.single('image'), createListing);
router.get('/mine', protect, authorize('Business'), getMyListings);
router.get('/pickups', protect, authorize('Consumer'), getMyPickups);
router.put('/:id', protect, authorize('Business'), uploadListing.single('image'), updateListing);
router.delete('/:id', protect, authorize('Business'), deleteListing);
router.post('/:id/claim', protect, authorize('Consumer'), claimListing);
router.post('/:id/verify-otp', protect, authorize('Business'), verifyOtp);

module.exports = router;
