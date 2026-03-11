const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/:gameId', authenticate, wishlistController.addToWishlist);
router.get('/', authenticate, wishlistController.getWishlist);
router.delete('/:gameId', authenticate, wishlistController.removeFromWishlist);

module.exports = router;