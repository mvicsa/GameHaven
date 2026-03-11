require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

    const env = {
      PORT: process.env.PORT || 3000,
      MONGODB_URI: process.env.MONGODB_URI ||
      'mongodb://localhost:27017/gamehaven',
      JWT_SECRET: process.env.JWT_SECRET 
    };

    console.log('MONGODB_URI:', env.MONGODB_URI); 

    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    module.exports = env;