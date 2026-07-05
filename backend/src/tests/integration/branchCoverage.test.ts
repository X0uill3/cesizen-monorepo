import request from 'supertest';
import jwt from 'jsonwebtoken';
import '../setup.js';
import app from '../../index.js';
import User from '../../models/User.js';
import DiagnosticTest from '../../models/DiagnosticTest.js';

type Role = 'USER' | 'ADMIN';

const createUserAndToken = async (role: Role = 'USER') => {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const email = `branch-${stamp}@example.com`;

    const signupResponse = await request(app).post('/api/auth/signup').send({
        firstname: 'Branch',
        lastname: 'Tester',
        email,
        password: 'Password123!',
        birthdate: '1990-01-01',
    });

    const userId: string = signupResponse.body.data.user._id;
    const token: string = signupResponse.body.token;

    if (role === 'ADMIN') {
        await User.findByIdAndUpdate(userId, { role: 'ADMIN' });
    }

    return { userId, token };
};

describe('Branch coverage scenarios', () => {
    it('covers missing user branch in protect middleware', async () => {
        const unknownUserToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET as string);

        const response = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${unknownUserToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toContain('Utilisateur introuvable');
    });

    it('covers softProtect disabled-account branch', async () => {
        const user = await createUserAndToken('USER');
        await User.findByIdAndUpdate(user.userId, { systemStatus: 'Disabled' });

        const response = await request(app)
            .get('/api/articles')
            .set('Authorization', `Bearer ${user.token}`);

        expect(response.status).toBe(403);
    });

    it('covers article not-found branches', async () => {
        const admin = await createUserAndToken('ADMIN');
        const missingId = '507f1f77bcf86cd799439011';

        const byIdResponse = await request(app)
            .get(`/api/articles/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(byIdResponse.status).toBe(404);

        const updateResponse = await request(app)
            .patch(`/api/articles/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'x' });
        expect(updateResponse.status).toBe(404);

        const activateResponse = await request(app)
            .patch(`/api/articles/${missingId}/activate`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(activateResponse.status).toBe(404);
    });

    it('covers diary report period branches', async () => {
        const user = await createUserAndToken('USER');

        const week = await request(app)
            .get('/api/diary/report?period=week')
            .set('Authorization', `Bearer ${user.token}`);
        expect(week.status).toBe(200);

        const month = await request(app)
            .get('/api/diary/report?period=month')
            .set('Authorization', `Bearer ${user.token}`);
        expect(month.status).toBe(200);

        const year = await request(app)
            .get('/api/diary/report?period=year')
            .set('Authorization', `Bearer ${user.token}`);
        expect(year.status).toBe(200);

        const fallback = await request(app)
            .get('/api/diary/report?period=other')
            .set('Authorization', `Bearer ${user.token}`);
        expect(fallback.status).toBe(200);
    });

    it('covers emotion not-found and invalid-id branches', async () => {
        const admin = await createUserAndToken('ADMIN');
        const missingId = '507f1f77bcf86cd799439011';

        const createDetailNoBase = await request(app)
            .post('/api/emotions/details')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'detail', baseEmotion: missingId });
        expect(createDetailNoBase.status).toBe(404);

        const invalidBaseIdResponse = await request(app)
            .get('/api/emotions/not-an-objectid/details')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(invalidBaseIdResponse.status).toBe(500);

        const updateBaseMissing = await request(app)
            .patch(`/api/emotions/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ color: '#111111' });
        expect(updateBaseMissing.status).toBe(404);

        const deactivateBaseMissing = await request(app)
            .delete(`/api/emotions/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(deactivateBaseMissing.status).toBe(404);

        const updateDetailMissing = await request(app)
            .patch(`/api/emotions/details/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'x' });
        expect(updateDetailMissing.status).toBe(404);

        const deactivateDetailMissing = await request(app)
            .delete(`/api/emotions/details/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(deactivateDetailMissing.status).toBe(404);
    });

    it('covers diagnostic admin not-found branches', async () => {
        const admin = await createUserAndToken('ADMIN');
        const missingId = '507f1f77bcf86cd799439011';

        const updateMissing = await request(app)
            .put(`/api/diagnostic/admin/tests/${missingId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ description: 'x' });
        expect(updateMissing.status).toBe(404);

        const toggleMissing = await request(app)
            .patch(`/api/diagnostic/admin/tests/${missingId}/toggle`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(toggleMissing.status).toBe(404);

        const toggleQuestionMissing = await request(app)
            .patch(`/api/diagnostic/admin/questions/${missingId}/toggle`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(toggleQuestionMissing.status).toBe(404);

        const test = await DiagnosticTest.create({ title: 'Temp', description: 'Temp', rules: [] });
        const forbiddenByRole = await request(app)
            .get(`/api/diagnostic/admin/tests/${String(test._id)}/questions`)
            .set('Authorization', `Bearer ${(await createUserAndToken('USER')).token}`);
        expect(forbiddenByRole.status).toBe(403);
    });
});
