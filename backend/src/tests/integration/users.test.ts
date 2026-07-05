import request from 'supertest';
import '../setup.js';
import app from '../../index.js';

describe('Users API - protected routes', () => {
    const userPayload = {
        firstname: 'Alice',
        lastname: 'Martin',
        email: 'alice.martin@example.com',
        password: 'Password123!',
        birthdate: '1995-09-10',
    };

    it('GET /api/users/me should return 401 without token', async () => {
        const response = await request(app).get('/api/users/me');

        expect(response.status).toBe(401);
        expect(response.body.message).toContain('aucun token');
    });

    it('GET /api/users/me should return current user with a valid token', async () => {
        const signupResponse = await request(app).post('/api/auth/signup').send(userPayload);
        const token = signupResponse.body.token;

        const response = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.user.email).toBe(userPayload.email);
    });
});
