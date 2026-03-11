const Cart = require('../models/Cart.model');
const Category = require('../models/Category.model');
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

  async getCategories() {
    return await Category.find({});
  }

  async getGamesByCategory(category) {
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      const error = new Error('Category is not exists!');
      error.status = 404;
      throw error;
    }

    return await Game.find({ category });
  }

  async addNewCategory(name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      const error = new Error('Category already exists!');
      error.status = 403;
      throw error;
    }

    return await Category.create({ name });
  }

  async updateCategory({ category, name }) {
    console.log(category)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: category }
    });

    if (existingCategory) {
      const error = new Error('Category already exists!');
      error.status = 403;
      throw error;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      category,
      { name },
      { new: true }
    );

    if (!updatedCategory) {
      const error = new Error('Category not found!');
      error.status = 404;
      throw error;
    }

    return updatedCategory;
  }

  async deleteCategory(category) {
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      const error = new Error('Category is not exists!');
      error.status = 404;
      throw error;
    }

    const games = await Game.find({ category });
    const gameIdsToDelete = games.map(game => game._id);

    await Game.deleteMany({ _id: { $in: gameIdsToDelete } });

    await Cart.updateMany({}, {
      $pull: {
        items: {
          gameId: { $in: gameIdsToDelete }
        }
      }
    });

    const deletedCategory = await Category.findByIdAndDelete(category);
    if (!deletedCategory) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }

    return deletedCategory;
  }
}

module.exports = new CartService();
