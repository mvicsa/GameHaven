const supertest = require('supertest');
const app = require('../app');
const request = supertest(app);

describe('Authentication Endpoints', () => {
    const testUser = {
        name: 'testuser',
        email: 'test2@example.com',
        password: 'password123'
};

    it('should register a new user', async () => {
        const res = await request
        .post('/api/auth/register')
        .send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('name', testUser.name);
        expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not register with existing email', async () => {

        const res = await request
        .post('/api/auth/register')
        .send(testUser);
        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error');
    });

    it('should login with correct credentials', async () => {

        const res = await request
        .post('/api/auth/login')
        .send({
            email: testUser.email,
            password: testUser.password
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
        const res = await request
        .post('/api/auth/login')
        .send({
            email: 'wrong@example.com',
            password: 'invalidpassword'
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
});