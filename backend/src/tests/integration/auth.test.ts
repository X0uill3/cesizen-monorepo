import request from 'supertest';
import '../setup.js';
import app from '../../index.js';
import User from '../../models/User.js';

describe('Auth API', () => {
    const signupPayload = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean.dupont@example.com',
        password: 'SecurePassword123!',
        birthdate: '1990-05-15',
    };

    it('POST /api/auth/signup should create a user and return a token', async () => {
        const response = await request(app).post('/api/auth/signup').send(signupPayload);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.token).toBeDefined();
        expect(response.body.data.user.email).toBe(signupPayload.email);
    });

    it('POST /api/auth/login should authenticate an existing user', async () => {
        await request(app).post('/api/auth/signup').send(signupPayload);

        const response = await request(app).post('/api/auth/login').send({
            email: signupPayload.email,
            password: signupPayload.password,
        });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.token).toBeDefined();
        expect(response.body.data.user.email).toBe(signupPayload.email);
    });

    it('POST /api/auth/login should return 400 when credentials are missing', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: signupPayload.email,
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Veuillez fournir un email et un mot de passe');
    });

    it('POST /api/auth/login should return 401 for invalid password', async () => {
        await request(app).post('/api/auth/signup').send(signupPayload);

        const response = await request(app).post('/api/auth/login').send({
            email: signupPayload.email,
            password: 'WrongPassword!',
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toContain('Email ou mot de passe incorrect');
    });

    it('POST /api/auth/login should return 403 for disabled account', async () => {
        const signupResponse = await request(app).post('/api/auth/signup').send(signupPayload);

        await User.findByIdAndUpdate(signupResponse.body.data.user._id, {
            systemStatus: 'Disabled',
        });

        const response = await request(app).post('/api/auth/login').send({
            email: signupPayload.email,
            password: signupPayload.password,
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('désactivé');
    });
});
