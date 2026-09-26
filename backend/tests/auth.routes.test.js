const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { connectTestDB, disconnectTestDB, clearTestDB } = require('./helpers/db');

test('auth routes', async (t) => {
    await connectTestDB();
    const app = require('../src/app'); // required after DB connects

    t.after(disconnectTestDB);
    t.beforeEach(clearTestDB);

    const validUser = { username: 'ayush', email: 'ayush@example.com', password: 'secret123' };

    await t.test('registers a new user and sets a cookie', async () => {
        const res = await request(app).post('/api/auth/register').send(validUser);
        assert.equal(res.status, 201);
        assert.equal(res.body.user.email, validUser.email);
        assert.ok(res.body.user.id);
        assert.equal(res.body.user.password, undefined, 'password hash must never be returned');
        assert.ok(res.headers['set-cookie']?.some((c) => c.startsWith('token=')));
    });

    await t.test('rejects registration with a short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validUser, password: '123' });
        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Validation failed');
    });

    await t.test('rejects registration with an invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...validUser, email: 'not-an-email' });
        assert.equal(res.status, 400);
    });

    await t.test('rejects duplicate username/email', async () => {
        await request(app).post('/api/auth/register').send(validUser);
        const res = await request(app).post('/api/auth/register').send(validUser);
        assert.equal(res.status, 400);
        assert.match(res.body.message, /already exists/);
    });

    await t.test('logs in with correct credentials', async () => {
        await request(app).post('/api/auth/register').send(validUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: validUser.password });
        assert.equal(res.status, 200);
        assert.ok(res.headers['set-cookie']?.some((c) => c.startsWith('token=')));
    });

    await t.test('rejects login with wrong password', async () => {
        await request(app).post('/api/auth/register').send(validUser);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: validUser.email, password: 'wrongpassword' });
        assert.equal(res.status, 400);
    });

    await t.test('get-me requires auth', async () => {
        const res = await request(app).get('/api/auth/get-me');
        assert.equal(res.status, 401);
    });

    await t.test('get-me returns the logged-in user with a valid cookie', async () => {
        const registerRes = await request(app).post('/api/auth/register').send(validUser);
        const cookie = registerRes.headers['set-cookie'];

        const res = await request(app).get('/api/auth/get-me').set('Cookie', cookie);
        assert.equal(res.status, 200);
        assert.equal(res.body.user.email, validUser.email);
    });

    await t.test('logout clears the cookie and blacklists the token', async () => {
        const registerRes = await request(app).post('/api/auth/register').send(validUser);
        const cookie = registerRes.headers['set-cookie'];
        assert.ok(cookie, 'registration must succeed and return a cookie for this test to be meaningful');

        const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie);
        assert.equal(logoutRes.status, 200);

        // the same (now-blacklisted) token must no longer work
        const meRes = await request(app).get('/api/auth/get-me').set('Cookie', cookie);
        assert.equal(meRes.status, 401);
    });
});
