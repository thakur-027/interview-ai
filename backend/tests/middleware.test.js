const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const { z } = require('zod');

const validate = require('../src/middlewares/validate.middleware');
const { notFound, errorHandler } = require('../src/middlewares/error.middleware');

test('validate middleware', async (t) => {
    const schema = z.object({ name: z.string().min(2) });
    const app = express();
    app.use(express.json());
    app.post('/thing', validate(schema), (req, res) => res.status(200).json({ received: req.body }));

    await t.test('passes valid input through and strips unknown fields', async () => {
        const res = await request(app).post('/thing').send({ name: 'ok', extra: 'ignored' });
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.received, { name: 'ok' });
    });

    await t.test('rejects invalid input with field-level errors', async () => {
        const res = await request(app).post('/thing').send({ name: 'x' });
        assert.equal(res.status, 400);
        assert.equal(res.body.message, 'Validation failed');
        assert.equal(res.body.errors[0].field, 'name');
    });
});

test('404 and error handlers', async (t) => {
    const app = express();
    app.get('/boom', () => {
        throw new Error('kaboom');
    });
    app.use(notFound);
    app.use(errorHandler);

    await t.test('unmatched routes return 404 with the path', async () => {
        const res = await request(app).get('/nope');
        assert.equal(res.status, 404);
        assert.match(res.body.message, /\/nope/);
    });

    await t.test('thrown errors are caught and return a generic 500 message', async () => {
        const res = await request(app).get('/boom');
        assert.equal(res.status, 500);
        assert.equal(res.body.message, 'Something went wrong. Please try again.');
    });
});
