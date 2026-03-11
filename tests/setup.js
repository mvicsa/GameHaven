const { default: mongoose } = require('mongoose');
const app = require('../app');
const { connectDB, disconnectDB } = require('../src/config/db');

let server;

beforeAll(async () => {
  await connectDB();
  server = app.listen(4000);
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
  await disconnectDB();
});

module.exports = { server };
