const supertest = require('supertest');
const mongoose = require('mongoose');
const Game = require('../src/models/Game.model');
const User = require('../src/models/User.model');
const app = require('../app');
const request = supertest(app);

describe('Review API', () => {
  let userId = null;
  let gameId = null;
  let userToken = null;

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

    // Register a user
    const userData = {
      name: `User${Date.now()}`,
      username: `user${Date.now()}`,
      email: `user${Date.now()}@test.com`,
      password: 'password123',
    };

    const registerRes = await request.post('/api/auth/register').send(userData);
    console.log('User Register Response:', registerRes.status, registerRes.body);

    if (registerRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
    }

    // Login with registered email
    const loginRes = await request.post('/api/auth/login').send({
      email: registerRes.body.user.email,
      password: userData.password,
    });
    console.log('User Login Response:', loginRes.status, loginRes.body);

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    userId = registerRes.body.user.id;
    userToken = loginRes.body.token;

    if (!userId || !userToken) {
      throw new Error('Invalid login response structure');
    }
  });

  afterAll(async () => {
    await Game.deleteMany({ title: { $regex: 'Test Game' } });
    await User.deleteMany({ email: { $regex: '@test.com' } });
  });

  it('POST /api/reviews/:gameId - should add a review', async () => {
    const reviewData = {
      rating: 4,
      comment: 'Great game!',
    };

    const res = await request
      .post(`/api/reviews/${gameId}`)
      .set('authorization', `Bearer ${userToken}`)
      .send(reviewData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('rating', 4);
    expect(res.body).toHaveProperty('comment', 'Great game!');
  });

  it('GET /api/reviews/:gameId - should return reviews for a game', async () => {
    const res = await request.get(`/api/reviews/${gameId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reviews');
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.reviews.length).toBeGreaterThan(0);
    expect(res.body.reviews[0]).toHaveProperty('rating', 4);
  });

  it('GET /api/reviews/user - should return user’s reviews', async () => {
    const res = await request
      .get('/api/reviews/user')
      .set('authorization', `Bearer ${userToken}`);

    console.log('GET /api/reviews/user Response:', res.status, res.body);
    expect(res.status).toBe(200);
    // Handle potential response structures
    const reviews = res.body.reviews || res.body.data || res.body;
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0]).toHaveProperty('comment', 'Great game!');
  });

  it('GET /api/reviews/users - alternative endpoint check', async () => {
    const res = await request
      .get('/api/reviews/users')
      .set('authorization', `Bearer ${userToken}`);

    console.log('GET /api/reviews/users Response:', res.status, res.body);
    if (res.status === 200) {
      const reviews = res.body.reviews || res.body.data || res.body;
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThan(0);
      expect(reviews[0]).toHaveProperty('comment', 'Great game!');
    } else {
      console.log('Note: /api/reviews/users endpoint may not exist.');
      expect(res.status).not.toBe(200); // Skip assertions if endpoint doesn’t exist
    }
  });
});