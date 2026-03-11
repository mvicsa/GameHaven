const app = require('./app');
const { connectDB } = require('./src/config/db');
const env = require('./src/config/env');

const PORT = env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
