const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Game = require('../src/models/Game.model');

describe('wishlist controller', () => {
  let token, userId, gameId;

  beforeAll(async () => {
    // Register and login user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: `User${Date.now()}`, email: `user${Date.now()}@test.com`, password: 'password123' });
    userId = registerRes.body.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: registerRes.body.user.email, password: 'password123' });
    token = loginRes.body.token;

    // Create a game with all required fields
    const game = new Game({
      title: 'Test Game',
      description: 'A test game description',
      price: 60,
      stock: 10,
      platform: 'PC',
      genre: 'Action',
      coverImage: 'test.jpg'
    });
    await game.save();
    gameId = game._id;
  });

  afterAll(async () => {
    // No need to drop database or close connection here; handled by setup.js
  });

  it('Add game to wishlist', async () => {
    const res = await request(app)
      .post(`/api/wishlist/${gameId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.games).toContainEqual(gameId.toString());
  });

  it('Get user wishlist', async () => {
    await request(app)
      .post(`/api/wishlist/${gameId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.games.length).toBeGreaterThan(0);
    expect(res.body.games[0]._id).toBe(gameId.toString());
  });

  it('Remove game from wishlist', async () => {
    await request(app)
      .post(`/api/wishlist/${gameId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/wishlist/${gameId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.games).not.toContainEqual(gameId.toString());
  });
});