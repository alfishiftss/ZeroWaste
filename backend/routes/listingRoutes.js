const express = require('express');
const router = express.Router();
const { createListing, getAllListings } = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');

// Public — get all active listings
router.get('/', getAllListings);

// Private — only Business or Admin can create listings
router.post('/', protect, authorize('Business', 'Admin'), createListing);

module.exports = router;
