const Wishlist = require('../models/Wishlist.model');
const Game = require('../models/Game.model');

class WishlistService {
  async addToWishlist(userId, gameId) {
    if (!userId || !gameId) throw new Error('User ID and Game ID are required');
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, games: [gameId] });
    } else if (!wishlist.games.includes(gameId)) {
      wishlist.games.push(gameId);
    }
    
    await wishlist.save();
    return { games: wishlist.games.map(id => id.toString()) };
  }

  async getWishlist(userId) {
    if (!userId) throw new Error('User ID is required');
    const wishlist = await Wishlist.findOne({ user: userId }).populate('games', 'title price');
    return wishlist ? { games: wishlist.games.map(game => ({ _id: game._id.toString(), title: game.title, price: game.price })) } : { games: [] };
  }

  async removeFromWishlist(userId, gameId) {
    if (!userId || !gameId) throw new Error('User ID and Game ID are required');
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) throw new Error('Wishlist not found');
    
    wishlist.games = wishlist.games.filter(id => id.toString() !== gameId);
    await wishlist.save();
    return { games: wishlist.games.map(id => id.toString()) };
  }
}

module.exports = new WishlistService();