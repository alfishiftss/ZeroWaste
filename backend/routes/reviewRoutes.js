const express = require('express');
const router = express.Router();
const { createReview, getBusinessReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Consumer'), createReview);
router.get('/business/:businessId', getBusinessReviews);

module.exports = router;
