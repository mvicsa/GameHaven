const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

class AuthService {
  async register({ name, email, password }) {
    let user = await User.findOne({ email });
    if (user) {
        const error = new Error('Email already exist.');
        error.status = 409;
        throw error;
    }
    user = new User({ name, email, password });
    await user.save();
    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }
    const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: '1d' });
    return { user, token };
  }
}

module.exports = new AuthService();