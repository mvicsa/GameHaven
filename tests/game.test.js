const supertest = require('supertest');
const mongoose = require('mongoose');
const Game = require('../src/models/Game.model');
const User = require('../src/models/User.model');
const app = require('../app');
const request = supertest(app);

describe('Game API', () => {
  let adminId = null;
  let gameId = null;
  let adminToken = null;

  beforeAll(async () => {
    // Create a test game
    const game = await Game.create({
      title: 'Test Game',
      description: 'A test game',
      genre: 'Action',
      platform: 'PC',
      price: 59.99,
      stock: 100,
      coverImage: 'test-image.jpg',
    });
    gameId = game._id;

    // Register an admin user
    const adminData = {
      name: `Admin${Date.now()}`,
      username: `admin${Date.now()}`,
      email: `admin${Date.now()}@test.com`,
      password: 'admin123',
    };

    const registerRes = await request.post('/api/auth/register').send(adminData);
    console.log('Admin Register Response:', registerRes.status, registerRes.body);

    if (registerRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
    }

    // Login with registered email
    const loginRes = await request.post('/api/auth/login').send({
      email: registerRes.body.user.email,
      password: adminData.password,
    });
    console.log('Admin Login Response:', loginRes.status, loginRes.body);

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    adminId = registerRes.body.user.id;
    adminToken = loginRes.body.token;

    if (!adminId || !adminToken) {
      throw new Error('Invalid login response structure');
    }

    // Set admin role (temporary workaround)
    try {
      await User.updateOne({ _id: adminId }, { role: 'admin' });
    } catch (err) {
      console.warn('Warning: Failed to set admin role. Admin endpoints may fail.', err.message);
    }
  });

  afterAll(async () => {
    await Game.deleteMany({ title: { $regex: 'Test Game' } });
    await User.deleteMany({ email: { $regex: '@test.com' } });
  });

  it('GET /api/games - should return an array of games', async () => {
    const res = await request.get('/api/games');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('games');
    expect(Array.isArray(res.body.games)).toBe(true);
    expect(res.body.games.length).toBeGreaterThan(0);
    expect(res.body.games[0].game).toHaveProperty('title', 'Test Game');
  });

  it('GET /api/games/:id - should return a specific game', async () => {
    const res = await request.get(`/api/games/${gameId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Game');
    expect(res.body._id).toBe(gameId.toString());
  });

  it('POST /api/games - should create a game (admin only)', async () => {
    const gameData = {
      title: 'Test Game 2',
      description: 'Another test game',
      genre: 'Adventure',
      platform: 'PS5',
      price: '49.99',
      stock: '50',
    };

    const res = await request
      .post('/api/games')
      .set('authorization', `Bearer ${adminToken}`)
      .field('title', gameData.title)
      .field('description', gameData.description)
      .field('genre', gameData.genre)
      .field('platform', gameData.platform)
      .field('price', gameData.price)
      .field('stock', gameData.stock)
      .attach('coverImage', Buffer.from('fake-image'), 'test.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'Test Game 2');
  });

  it('PUT /api/games/:id - should update a game (admin only)', async () => {
    const updateData = {
      title: 'Updated Test Game',
      price: '69.99',
    };

    const res = await request
      .put(`/api/games/${gameId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .field('title', updateData.title)
      .field('price', updateData.price)
      .attach('coverImage', Buffer.from('fake-image'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated Test Game');
  });

  it('DELETE /api/games/:id - should delete a game (admin only)', async () => {
    const res = await request
      .delete(`/api/games/${gameId}`)
      .set('authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });
});