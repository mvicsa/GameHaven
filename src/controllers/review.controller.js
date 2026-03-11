const { body, param, validationResult } = require('express-validator');
const reviewService = require('../services/review.service');

const addReview = [
  param('gameId').isMongoId().withMessage('Invalid game ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    try {
      const review = await reviewService.addReview(req.user._id, req.params.gameId, req.body);
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  },
];

const getReviews = [
  param('gameId').isMongoId().withMessage('Invalid game ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    try {
      const { reviews, totalReviews, averageRating } = await reviewService.getReviews(req.params.gameId);
      res.status(200).json({ reviews, totalReviews, averageRating });
    } catch (err) {
      next(err);
    }
  },
];

const getUserReviews = [
  async (req, res, next) => {
    try {
      const reviews = await reviewService.getUserReviews(req.user._id);
      res.status(200).json(reviews);
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { addReview, getReviews, getUserReviews };