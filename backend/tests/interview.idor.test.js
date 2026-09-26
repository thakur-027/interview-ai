const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { connectTestDB, disconnectTestDB, clearTestDB } = require('./helpers/db');

async function registerUser(app, overrides = {}) {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            username: 'user' + Math.random().toString(36).slice(2, 8),
            email: `user${Math.random().toString(36).slice(2, 8)}@example.com`,
            password: 'secret123',
            ...overrides,
        });
    return { cookie: res.headers['set-cookie'], userId: res.body.user.id };
}

test('interview report ownership (IDOR regression)', async (t) => {
    await connectTestDB();
    const app = require('../src/app');
    const interviewReportModel = require('../src/models/interviewReport.model');

    t.after(disconnectTestDB);
    t.beforeEach(clearTestDB);

    await t.test('user cannot fetch another user\'s report by ID', async () => {
        const owner = await registerUser(app);
        const attacker = await registerUser(app);

        const report = await interviewReportModel.create({
            jobDescription: 'Backend Engineer',
            title: 'Backend Engineer',
            user: owner.userId,
        });

        const res = await request(app)
            .get(`/api/interview/report/${report._id}`)
            .set('Cookie', attacker.cookie);

        assert.equal(res.status, 404, 'attacker must not be able to read another user\'s report');
    });

    await t.test('owner can fetch their own report by ID', async () => {
        const owner = await registerUser(app);
        const report = await interviewReportModel.create({
            jobDescription: 'Backend Engineer',
            title: 'Backend Engineer',
            user: owner.userId,
        });

        const res = await request(app)
            .get(`/api/interview/report/${report._id}`)
            .set('Cookie', owner.cookie);

        assert.equal(res.status, 200);
        assert.equal(res.body.interviewReport._id, String(report._id));
    });

    await t.test('user cannot generate/download another user\'s resume PDF (the fixed bug)', async () => {
        const owner = await registerUser(app);
        const attacker = await registerUser(app);

        const report = await interviewReportModel.create({
            jobDescription: 'Backend Engineer',
            title: 'Backend Engineer',
            resume: 'confidential resume text',
            selfDescription: 'confidential self description',
            user: owner.userId,
        });

        const res = await request(app)
            .post(`/api/interview/resume/pdf/${report._id}`)
            .set('Cookie', attacker.cookie);

        // Must be blocked by the ownership check before Puppeteer ever runs.
        assert.equal(res.status, 404, 'attacker must not be able to generate another user\'s resume PDF');
    });

    await t.test('a user only sees their own reports in the list endpoint', async () => {
        const owner = await registerUser(app);
        const other = await registerUser(app);

        await interviewReportModel.create({ jobDescription: 'A', title: 'A', user: owner.userId });
        await interviewReportModel.create({ jobDescription: 'B', title: 'B', user: other.userId });

        const res = await request(app).get('/api/interview').set('Cookie', owner.cookie);
        assert.equal(res.status, 200);
        assert.equal(res.body.interviewReports.length, 1);
        assert.equal(res.body.interviewReports[0].title, 'A');
    });
});
