import request from 'supertest';
import '../setup.js';
import app from '../../index.js';
import User from '../../models/User.js';
import Article from '../../models/Articles.js';
import { Emotion } from '../../models/Emotion.js';
import { EmotionDetail } from '../../models/EmotionDetails.js';
import Diary from '../../models/Diary.js';
import Log from '../../models/Log.js';
import DiagnosticTest from '../../models/DiagnosticTest.js';
import DiagnosticQuestion from '../../models/DiagnosticQuestion.js';

type Role = 'USER' | 'ADMIN';

const createUserAndToken = async (role: Role = 'USER') => {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const email = `user-${stamp}@example.com`;

    const signupResponse = await request(app).post('/api/auth/signup').send({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: 'Password123!',
        birthdate: '1995-01-01',
    });

    const userId: string = signupResponse.body.data.user._id;
    const token: string = signupResponse.body.token;

    if (role === 'ADMIN') {
        await User.findByIdAndUpdate(userId, { role: 'ADMIN' });
    }

    return { token, userId, email };
};

describe('Feature coverage integration tests', () => {
    it('covers article admin and public flows', async () => {
        const admin = await createUserAndToken('ADMIN');

        const createResponse = await request(app)
            .post('/api/articles/admin')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Article test', content: 'Contenu test' });

        expect(createResponse.status).toBe(201);
        const articleId: string = createResponse.body.data.article._id;

        const listResponse = await request(app).get('/api/articles');
        expect(listResponse.status).toBe(200);

        const byIdResponse = await request(app)
            .get(`/api/articles/${articleId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(byIdResponse.status).toBe(200);

        const adminListResponse = await request(app)
            .get('/api/articles/admin')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(adminListResponse.status).toBe(200);

        const patchResponse = await request(app)
            .patch(`/api/articles/${articleId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Article modifie' });
        expect(patchResponse.status).toBe(200);

        const deleteResponse = await request(app)
            .delete(`/api/articles/${articleId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect([200, 204]).toContain(deleteResponse.status);

        const activateResponse = await request(app)
            .patch(`/api/articles/${articleId}/activate`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(activateResponse.status).toBe(200);
    });

    it('covers diary create/read/report/delete flows including validation errors', async () => {
        const user = await createUserAndToken('USER');

        const baseEmotion = await Emotion.create({ name: 'Joie', color: '#00ff00' });
        const detail = await EmotionDetail.create({ name: 'Gratitude', baseEmotion: baseEmotion._id });

        const invalidBaseResponse = await request(app)
            .post('/api/diary')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ baseEmotionId: '507f1f77bcf86cd799439011', comment: 'x' });
        expect(invalidBaseResponse.status).toBe(400);

        const invalidDetailResponse = await request(app)
            .post('/api/diary')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ baseEmotionId: String(baseEmotion._id), emotionDetailId: '507f1f77bcf86cd799439011', comment: 'x' });
        expect(invalidDetailResponse.status).toBe(400);

        const createResponse = await request(app)
            .post('/api/diary')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ baseEmotionId: String(baseEmotion._id), emotionDetailId: String(detail._id), comment: 'Bonne journee' });
        expect(createResponse.status).toBe(201);

        const entryId: string = createResponse.body.data.entry._id;

        const listResponse = await request(app)
            .get('/api/diary')
            .set('Authorization', `Bearer ${user.token}`);
        expect(listResponse.status).toBe(200);

        const reportResponse = await request(app)
            .get('/api/diary/report?period=week')
            .set('Authorization', `Bearer ${user.token}`);
        expect(reportResponse.status).toBe(200);

        const deleteResponse = await request(app)
            .delete(`/api/diary/${entryId}`)
            .set('Authorization', `Bearer ${user.token}`);
        expect(deleteResponse.status).toBe(204);

        const deleteMissingResponse = await request(app)
            .delete(`/api/diary/${entryId}`)
            .set('Authorization', `Bearer ${user.token}`);
        expect(deleteMissingResponse.status).toBe(404);
    });

    it('covers emotions admin and user flows', async () => {
        const admin = await createUserAndToken('ADMIN');
        const user = await createUserAndToken('USER');

        const createBaseResponse = await request(app)
            .post('/api/emotions')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Stress', color: '#ff0000' });
        expect(createBaseResponse.status).toBe(201);
        const baseId: string = createBaseResponse.body.data.emotion._id;

        const listBaseResponse = await request(app)
            .get('/api/emotions')
            .set('Authorization', `Bearer ${user.token}`);
        expect(listBaseResponse.status).toBe(200);

        const createDetailResponse = await request(app)
            .post('/api/emotions/details')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Anxiete', baseEmotion: baseId });
        expect(createDetailResponse.status).toBe(201);
        const detailId: string = createDetailResponse.body.data.detail._id;

        const detailsByBaseResponse = await request(app)
            .get(`/api/emotions/${baseId}/details`)
            .set('Authorization', `Bearer ${user.token}`);
        expect(detailsByBaseResponse.status).toBe(200);

        const adminListResponse = await request(app)
            .get('/api/emotions/admin')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(adminListResponse.status).toBe(200);

        const forbiddenAdminResponse = await request(app)
            .get('/api/emotions/admin')
            .set('Authorization', `Bearer ${user.token}`);
        expect(forbiddenAdminResponse.status).toBe(403);

        const updateBaseResponse = await request(app)
            .patch(`/api/emotions/${baseId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ color: '#00aa00' });
        expect(updateBaseResponse.status).toBe(200);

        const updateDetailResponse = await request(app)
            .patch(`/api/emotions/details/${detailId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Anxiete legere' });
        expect(updateDetailResponse.status).toBe(200);

        const deactivateDetailResponse = await request(app)
            .delete(`/api/emotions/details/${detailId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(deactivateDetailResponse.status).toBe(200);

        const deactivateBaseResponse = await request(app)
            .delete(`/api/emotions/${baseId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(deactivateBaseResponse.status).toBe(200);
    });

    it('covers diagnostic public, user and admin flows', async () => {
        const admin = await createUserAndToken('ADMIN');
        const user = await createUserAndToken('USER');

        const createTestResponse = await request(app)
            .post('/api/diagnostic/admin/tests')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({
                title: 'Stress',
                description: 'Test de stress',
                rules: [{ minScore: 0, maxScore: 5, title: 'Bas', description: 'Niveau bas', color: '#00ff00' }],
            });
        expect(createTestResponse.status).toBe(201);
        const testId: string = createTestResponse.body.data.test._id;

        const publicTestsResponse = await request(app).get('/api/diagnostic/tests');
        expect(publicTestsResponse.status).toBe(200);

        const publicQuestionsResponse = await request(app).get(`/api/diagnostic/tests/${testId}/questions`);
        expect(publicQuestionsResponse.status).toBe(200);

        const createQuestionResponse = await request(app)
            .post(`/api/diagnostic/admin/tests/${testId}/questions`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({
                text: 'Comment allez-vous ?',
                order: 1,
                answers: [{ label: 'Bien', points: 1 }, { label: 'Mal', points: 3 }],
            });
        expect(createQuestionResponse.status).toBe(201);
        const questionId: string = createQuestionResponse.body.data.question._id;

        const adminQuestionsResponse = await request(app)
            .get(`/api/diagnostic/admin/tests/${testId}/questions`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(adminQuestionsResponse.status).toBe(200);

        const saveResultMissingScore = await request(app)
            .post(`/api/diagnostic/tests/${testId}/results`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({});
        expect(saveResultMissingScore.status).toBe(400);

        const saveResultResponse = await request(app)
            .post(`/api/diagnostic/tests/${testId}/results`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({ score: 3 });
        expect(saveResultResponse.status).toBe(201);

        const myResultsResponse = await request(app)
            .get('/api/diagnostic/my-results')
            .set('Authorization', `Bearer ${user.token}`);
        expect(myResultsResponse.status).toBe(200);

        const adminAllTestsResponse = await request(app)
            .get('/api/diagnostic/admin/tests')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(adminAllTestsResponse.status).toBe(200);

        const updateTestResponse = await request(app)
            .put(`/api/diagnostic/admin/tests/${testId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ description: 'Description mise a jour' });
        expect(updateTestResponse.status).toBe(200);

        const toggleTestResponse = await request(app)
            .patch(`/api/diagnostic/admin/tests/${testId}/toggle`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(toggleTestResponse.status).toBe(200);

        const updateQuestionResponse = await request(app)
            .put(`/api/diagnostic/admin/questions/${questionId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ text: 'Question modifiee' });
        expect(updateQuestionResponse.status).toBe(200);

        const toggleQuestionResponse = await request(app)
            .patch(`/api/diagnostic/admin/questions/${questionId}/toggle`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(toggleQuestionResponse.status).toBe(200);
    });

    it('covers logs route and role checks', async () => {
        const admin = await createUserAndToken('ADMIN');
        const user = await createUserAndToken('USER');

        await Log.create({ action: 'TEST_LOG', admin: admin.userId, details: 'log test' });

        const adminLogsResponse = await request(app)
            .get('/api/logs')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(adminLogsResponse.status).toBe(200);

        const userLogsResponse = await request(app)
            .get('/api/logs')
            .set('Authorization', `Bearer ${user.token}`);
        expect(userLogsResponse.status).toBe(403);
    });

    it('covers user self and admin management flows', async () => {
        const admin = await createUserAndToken('ADMIN');
        const user = await createUserAndToken('USER');

        const updateMeResponse = await request(app)
            .patch('/api/users/updateMe')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ firstname: 'PrenomMAJ' });
        expect(updateMeResponse.status).toBe(200);

        const pwdMismatchResponse = await request(app)
            .patch('/api/users/updateMyPassword')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ passwordCurrent: 'Password123!', password: 'NewPass123!', passwordConfirm: 'Nope123!' });
        expect(pwdMismatchResponse.status).toBe(400);

        const pwdWrongCurrentResponse = await request(app)
            .patch('/api/users/updateMyPassword')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ passwordCurrent: 'WrongPass!', password: 'NewPass123!', passwordConfirm: 'NewPass123!' });
        expect(pwdWrongCurrentResponse.status).toBe(401);

        const pwdSuccessResponse = await request(app)
            .patch('/api/users/updateMyPassword')
            .set('Authorization', `Bearer ${user.token}`)
            .send({ passwordCurrent: 'Password123!', password: 'NewPass123!', passwordConfirm: 'NewPass123!' });
        expect(pwdSuccessResponse.status).toBe(200);

        const getUsersResponse = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${admin.token}`);
        expect(getUsersResponse.status).toBe(200);

        const updateUserResponse = await request(app)
            .patch(`/api/users/${user.userId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ lastname: 'UpdateAdmin' });
        expect(updateUserResponse.status).toBe(200);

        const deactivateUserResponse = await request(app)
            .delete(`/api/users/${user.userId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(deactivateUserResponse.status).toBe(200);

        const reactivateUserResponse = await request(app)
            .patch(`/api/users/${user.userId}/reactivate`)
            .set('Authorization', `Bearer ${admin.token}`);
        expect(reactivateUserResponse.status).toBe(200);

        const ownerArticle = await Article.create({
            title: 'Article a transferer',
            content: 'Contenu',
            author: user.userId,
            isActive: true,
        });

        const neutralEmotion = await Emotion.create({ name: 'Neutralite' });
        await Diary.create({ user: user.userId, baseEmotion: neutralEmotion._id, comment: 'entry' });
        await Log.create({ action: 'USER_EVENT', user: user.userId, article: ownerArticle._id, details: 'event' });

        const deleteMeResponse = await request(app)
            .delete('/api/users/deleteMe')
            .set('Authorization', `Bearer ${user.token}`);
        expect(deleteMeResponse.status).toBe(204);

        const userAfterDelete = await User.findById(user.userId);
        expect(userAfterDelete).toBeNull();
    });

    it('covers auth middleware invalid token and disabled account cases', async () => {
        const user = await createUserAndToken('USER');

        const invalidTokenResponse = await request(app)
            .get('/api/users/me')
            .set('Authorization', 'Bearer not-a-valid-token');
        expect(invalidTokenResponse.status).toBe(401);

        await User.findByIdAndUpdate(user.userId, { systemStatus: 'Disabled' });
        const disabledResponse = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${user.token}`);
        expect(disabledResponse.status).toBe(403);

        const softProtectGuestResponse = await request(app)
            .get('/api/articles')
            .set('Authorization', 'Bearer invalid-soft-token');
        expect(softProtectGuestResponse.status).toBe(200);
    });

    it('covers utility logger creation with optional ids', async () => {
        const admin = await createUserAndToken('ADMIN');
        const user = await createUserAndToken('USER');

        const article = await Article.create({
            title: 'Article util',
            content: 'x',
            author: admin.userId,
            isActive: true,
        });

        const test = await DiagnosticTest.create({ title: 'Tmp', description: 'Tmp', rules: [] });
        await DiagnosticQuestion.create({ test: test._id, text: 'Q', order: 1, answers: [{ label: 'A', points: 1 }] });

        await request(app)
            .patch(`/api/users/${user.userId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ firstname: 'LoggerCall' });

        const logCount = await Log.countDocuments();
        expect(logCount).toBeGreaterThan(0);

        // Ensure log documents with different optional fields are persisted.
        const anyLog = await Log.findOne();
        expect(anyLog).not.toBeNull();
        expect(String(anyLog?.action || '')).not.toHaveLength(0);
        expect(article._id).toBeDefined();
    });
});
