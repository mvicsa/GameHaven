const { body, param } = require('express-validator');
const validate = require('../middlewares/validation.middleware');
const cartService = require('../services/cart.service');

// Get Cart Items
const getCartItems = [
  validate,
  async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const cartItems = await cartService.getCart(userId);
      res.status(200).json({ data: cartItems.items ? cartItems.items : cartItems });
    } catch (err) {
      console.error("Error while fetching Cart:", err);
      next(err);
    }
  },
];

// Add To Cart
const addToCart = [
  body('gameId').isMongoId().withMessage('Invalid game ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate,
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { gameId, quantity } = req.body;

    try {
      const newCartItem = await cartService.addToCart({ userId, gameId, quantity });
      res.status(201).json({
        data: newCartItem,
        message: "Game Added to Cart",
      });
    } catch (err) {
      console.error("Error while Adding to Cart:", err);
      next(err);
    }
  },
];

// Update Cart Item
const updateCartItem = [
  param('gameId').isMongoId().withMessage('Invalid game ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate,
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { gameId } = req.params;
    const { quantity } = req.body;

    try {
      const updatedCartItem = await cartService.updateCartItem({ userId, gameId, quantity });
      res.status(200).json({
        data: updatedCartItem,
        message: "Game Updated in Cart",
      });
    } catch (err) {
      console.error("Error while Updating game in Cart:", err);
      next(err);
    }
  },
];

// Delete From Cart
const deleteFromCart = [
  param('gameId').isMongoId().withMessage('Invalid game ID'),
  validate,
  async (req, res, next) => {
    const { id: userId } = req.user;
    const { gameId } = req.params;

    try {
      await cartService.deleteFromCart({ userId, gameId });
      res.status(200).json({
        message: "Game Deleted from Cart",
      });
    } catch (err) {
      console.error("Error while Deleting Game from Cart:", err);
      next(err);
    }
  },
];

module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteFromCart,
};
