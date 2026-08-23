const express = require('express');
const router = express.Router();
const {
    createListing,
    getMyListings,
    getAllListings,
    updateListing,
    deleteListing,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const uploadListing = require('../middleware/uploadListing');

router.get('/', getAllListings);
router.post('/', protect, authorize('Business'), uploadListing.single('image'), createListing);
router.get('/mine', protect, authorize('Business'), getMyListings);
router.put('/:id', protect, authorize('Business'), uploadListing.single('image'), updateListing);
router.delete('/:id', protect, authorize('Business'), deleteListing);

module.exports = router;
