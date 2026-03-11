const mongoose = require('mongoose');
const logger = require('../utils/logger');
const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGODB_URI;
    await mongoose.connect(uri);
    logger.info(`MongoDB connected to ${uri}`);
  } catch (err) {
    logger.error('Database connection failed:', err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Database disconnection failed:', err);
  }
};

module.exports = { connectDB, disconnectDB };