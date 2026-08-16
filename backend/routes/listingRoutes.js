const express = require('express');
const router = express.Router();
const { createListing, getMyListings, getAllListings } = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllListings);
router.post('/', protect, authorize('Business'), createListing);
router.get('/mine', protect, authorize('Business'), getMyListings);

module.exports = router;
