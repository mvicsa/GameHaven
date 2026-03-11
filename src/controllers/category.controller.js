const { body, param } = require('express-validator');
const validate = require('../middlewares/validation.middleware');
const categoryService = require('../services/category.service');

// Get All Categories
const getCategories = [
  async (req, res, next) => {
    try {
      const categories = await categoryService.getCategories();
      res.status(200).json({ data: categories });
    } catch (err) {
      console.error('Error while fetching Categories:', err);
      next(err);
    }
  },
];

// Get Games by Category
const getGamesByCategory = [
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  validate,
  async (req, res, next) => {
    try {
      const games = await categoryService.getGamesByCategory(req.params.categoryId);
      res.status(200).json({ data: games });
    } catch (err) {
      console.error('Error while fetching Games From Category:', err);
      next(err);
    }
  },
];

// Create New Category
const createCategory = [
  body('name').notEmpty().withMessage('Category name is required'),
  validate,
  async (req, res, next) => {
    try {
      const newCategory = await categoryService.addNewCategory(req.body.name);
      res.status(201).json({
        data: newCategory,
        message: 'Category Added Successfully!',
      });
    } catch (err) {
      console.error('Error while Adding New Category:', err);
      next(err);
    }
  },
];

// Update Category
const updateCategory = [
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  body('name').notEmpty().withMessage('Category name is required'),
  validate,
  async (req, res, next) => {
    try {
      const updatedCategory = await categoryService.updateCategory({
        category: req.params.categoryId,
        name: req.body.name,
      });
      res.status(200).json({
        data: updatedCategory,
        message: 'Category Updated Successfully!',
      });
    } catch (err) {
      console.error('Error while Updating Category:', err);
      next(err);
    }
  },
];

// Delete Category
const deleteCategory = [
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  validate,
  async (req, res, next) => {
    try {
      await categoryService.deleteCategory(req.params.categoryId);
      res.status(200).json({
        message: 'Category Deleted Successfully!',
      });
    } catch (err) {
      console.error('Error while Deleting Category:', err);
      next(err);
    }
  },
];

module.exports = {
  getCategories,
  getGamesByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
