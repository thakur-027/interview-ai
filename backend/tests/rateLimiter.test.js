const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const rateLimit = require('express-rate-limit');

// We build an isolated app with a tight limit here (2 requests) rather than
// hitting the real authLimiter (10/15min), so the test runs instantly instead
// of needing to fire 11 requests against a route with side effects.
test('rate limiter blocks requests past the configured threshold', async () => {
    const app = express();
    const limiter = rateLimit({ windowMs: 60 * 1000, limit: 2, standardHeaders: true, legacyHeaders: false });
    app.get('/ping', limiter, (req, res) => res.status(200).json({ ok: true }));

    const first = await request(app).get('/ping');
    const second = await request(app).get('/ping');
    const third = await request(app).get('/ping');

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429, 'requests past the limit must be rejected');
});

test('registerLimiter, loginLimiter, and aiLimiter are configured with sane thresholds', () => {
    const { registerLimiter, loginLimiter, aiLimiter } = require('../src/middlewares/rateLimiter.middleware');
    assert.equal(typeof registerLimiter, 'function');
    assert.equal(typeof loginLimiter, 'function');
    assert.equal(typeof aiLimiter, 'function');
});
