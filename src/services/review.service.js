const Review = require('../models/Review.model');
const Game = require('../models/Game.model');

class ReviewService {
  async addReview(userId, gameId, { rating, comment }) {
    if (!userId || !gameId) throw new Error('User ID and Game ID are required');
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    const existingReview = await Review.findOne({ user: userId, game: gameId });
    if (existingReview) throw new Error('Review already exists for this game');
    const review = new Review({ user: userId, game: gameId, rating, comment });
    return await review.save();
  }

  async getReviews(gameId) {
    if (!gameId) throw new Error('Game ID is required');
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    const reviews = await Review.find({ game: gameId }).populate('user', 'name');
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
    return {
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(2)) 
    };
  }

  async getUserReviews(userId) {
    if (!userId) throw new Error('User ID is required');
    return await Review.find({ user: userId }).populate('game', 'title');
  }

}

module.exports = new ReviewService();