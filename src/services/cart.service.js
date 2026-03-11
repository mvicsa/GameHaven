const Cart = require('../models/Cart.model');
const Game = require('../models/Game.model');

class CartService {
  async getCart(userId) {
    const cart = await Cart.findOne({ userId }).populate('items.gameId', 'price');

    if (!cart || !cart.items.length) return [];

    const cartItems = cart.items.map(item => ({
      gameId: item.gameId._id,
      quantity: item.quantity,
      price: item.gameId.price * item.quantity
    }));

    const totalPrice = cart.items.reduce((sum, item) => {
      const price = item.gameId.price || 0;
      return sum + (item.quantity * price);
    }, 0);

    return {
      cartItems,
      totalPrice
    };
  }

  async addToCart({ userId, gameId, quantity = 1 }) {
    const cart = await Cart.findOne({ userId });
    const game = await Game.findById(gameId);

    if (!game) {
      const error = new Error('Game is Not Found!');
      error.status = 404;
      throw error;
    }

    if (!cart) {
      if (quantity > game.stock) {
        const error = new Error('Quantity is Not Available!');
        error.status = 400;
        throw error;
      }

      const newCart = await Cart.create({
        userId,
        items: [{ gameId, quantity }],
      });
      return newCart;
    }

    const itemIndex = cart.items.findIndex(item => item.gameId.toString() === gameId.toString());

    if (itemIndex > -1) {
      const totalQuantity = cart.items[itemIndex].quantity + quantity;
      if (totalQuantity > game.stock) {
        const error = new Error('Quantity is Not Available!');
        error.status = 400;
        throw error;
      }
      cart.items[itemIndex].quantity = totalQuantity;
    } else {
      cart.items.push({ gameId, quantity });
    }

    return await cart.save();
  }

  async updateCartItem({ userId, gameId, quantity }) {
    const cart = await Cart.findOne({ userId });
    const game = await Game.findById(gameId);

    if (!cart) {
      const error = new Error('Cart not found');
      error.status = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex(item => item.gameId.toString() === gameId.toString());

    if (itemIndex === -1) {
      const error = new Error('Game not found in cart');
      error.status = 404;
      throw error;
    }

    if (quantity > game.stock) {
      const error = new Error('Quantity is Not Available!');
      error.status = 400;
      throw error;
    }

    cart.items[itemIndex].quantity = quantity;
    return await cart.save();
  }

  async deleteFromCart({ userId, gameId }) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      const error = new Error('Cart not found');
      error.status = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex(item => item.gameId.toString() === gameId.toString());

    if (itemIndex === -1) {
      const error = new Error('Game not found in cart');
      error.status = 404;
      throw error;
    }

    cart.items.splice(itemIndex, 1);
    return await cart.save();
  }
}

module.exports = new CartService();
