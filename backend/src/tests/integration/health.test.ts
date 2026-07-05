import request from 'supertest';
import '../setup.js';
import app from '../../index.js';

describe('Healthcheck API', () => {
    it('GET / should return API status message', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('API CESIZen opérationnelle');
    });
});
