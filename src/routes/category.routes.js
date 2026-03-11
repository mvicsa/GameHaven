const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', categoryController.getCategories);
router.get('/:categoryId', categoryController.getGamesByCategory);
router.post('/', authenticate, restrictTo('admin'),categoryController.createCategory);
router.put('/:categoryId', authenticate, restrictTo('admin'), categoryController.updateCategory);
router.delete('/:categoryId',authenticate,restrictTo('admin'),categoryController.deleteCategory);

module.exports = router;
