const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validation.middleware');
const gameService = require('../services/game.service');
const { saveFile } = require('../utils/uploadConfig');
const fs = require('fs');

const getGames = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
  query('genre').optional().isString().withMessage('Invalid genre'),
  query('platform').optional().isString().withMessage('Invalid platform'),
  query('search').optional().isString().withMessage('Invalid search term'),
  validate,
  async (req, res, next) => {
    try {
      const games = await gameService.getGames(req.query);
      console.log('Games from controller:', games); 
      res.status(200).json(games);
    } catch (err) {
      next(err);
    }
  },
];

const getGame = [
  param('id').isMongoId().withMessage('Invalid game ID'),
  validate,
  async (req, res, next) => {
    try {
      const game = await gameService.getGame(req.params.id);
      res.status(200).json(game);
    } catch (err) {
      next(err);
    }
  },
];

const createGame = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('genre').notEmpty().withMessage('Genre is required'),
  body('price').isFloat({ min: 0 }).withMessage('Invalid price'),
  body('stock').isInt({ min: 0 }).withMessage('Invalid stock'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  validate,
  async (req, res, next) => {
    try {
      const { title } = req.body;
      let coverImagePath = null;

      const gameExists = await gameService.checkGameExists(title);
      if (gameExists) {
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete file:', err);
          });
        }
        throw new Error('Game already exists');
      }

      if (!req.file) {
        throw new Error('No file uploaded');
      }
      coverImagePath = await saveFile(req.file);
      if (!coverImagePath || typeof coverImagePath !== 'string') {
        throw new Error('Failed to save file');
      }

      const data = {
        ...req.body,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        coverImage: coverImagePath,
      };
      const game = await gameService.createGame(data);
      res.status(201).json(game);
    } catch (err) {
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to delete file:', err);
        });
      }
      next(err);
    }
  },
];

const updateGame = [
  param('id').isMongoId().withMessage('Invalid game ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('platform').optional().notEmpty().withMessage('Platform cannot be empty'),
  body('genre').optional().notEmpty().withMessage('Genre cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Invalid price'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Invalid stock'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  validate,
  async (req, res, next) => {
    try {
      let coverImagePath = null;
      if (req.file) {
        coverImagePath = await saveFile(req.file);
        if (!coverImagePath || typeof coverImagePath !== 'string') {
          throw new Error('Failed to save file');
        }
      }

      const data = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        stock: req.body.stock ? parseInt(req.body.stock) : undefined,
        coverImage: coverImagePath,
      };
      const game = await gameService.updateGame(req.params.id, data);
      res.status(200).json(game);
    } catch (err) {
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to delete file:', err);
        });
      }
      next(err);
    }
  },
];

const deleteGame = [
  param('id').isMongoId().withMessage('Invalid game ID'),
  validate,
  async (req, res, next) => {
    try {
      await gameService.deleteGame(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { getGames, getGame, createGame, updateGame, deleteGame };
