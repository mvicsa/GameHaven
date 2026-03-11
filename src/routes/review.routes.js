const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/user', authenticate, reviewController.getUserReviews); 
router.post('/:gameId', authenticate, reviewController.addReview);
router.get('/:gameId', reviewController.getReviews);

module.exports = router;