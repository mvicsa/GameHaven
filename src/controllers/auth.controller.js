const { body } = require('express-validator');
const validate = require('../middlewares/validation.middleware');
const authService = require('../services/auth.service');

const register = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  },
];

const login = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res, next) => {
    try {
      const { user, token } = await authService.login(req.body);
      res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { register, login };