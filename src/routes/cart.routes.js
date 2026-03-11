const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', authenticate, restrictTo('user'), cartController.getCartItems);
router.post('/',authenticate, restrictTo('user'), cartController.addToCart);
router.put('/:gameId', authenticate, restrictTo('user'), cartController.updateCartItem);
router.delete('/:gameId', authenticate, restrictTo('user'), cartController.deleteFromCart);

module.exports = router;