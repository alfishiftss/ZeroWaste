const express = require('express');
const router = express.Router();
const { createClaim, getConsumerClaims } = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all claim routes
router.use(protect);

// Only consumers can access these routes
router.use(authorize('Consumer'));

// Create a new claim
router.post('/', createClaim);

// Get logged in consumer's claims
router.get('/my-claims', getConsumerClaims);

module.exports = router;
