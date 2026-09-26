const test = require('node:test');
const assert = require('node:assert/strict');

const { registerSchema, loginSchema } = require('../src/validations/auth.validation');
const { generateReportSchema } = require('../src/validations/interview.validation');

test('registerSchema', () => {
    assert.equal(registerSchema.safeParse({ username: 'ab', email: 'a@b.com', password: '123456' }).success, true);
    assert.equal(registerSchema.safeParse({ username: 'a', email: 'a@b.com', password: '123456' }).success, false, 'username too short');
    assert.equal(registerSchema.safeParse({ username: 'ab', email: 'not-an-email', password: '123456' }).success, false, 'bad email');
    assert.equal(registerSchema.safeParse({ username: 'ab', email: 'a@b.com', password: '123' }).success, false, 'password too short');

    // lowercases + trims email
    const result = registerSchema.safeParse({ username: ' ab ', email: '  A@B.COM  ', password: '123456' });
    assert.equal(result.success, true);
    assert.equal(result.data.email, 'a@b.com');
    assert.equal(result.data.username, 'ab');
});

test('loginSchema', () => {
    assert.equal(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success, true);
    assert.equal(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success, false);
    assert.equal(loginSchema.safeParse({ email: 'nope', password: 'x' }).success, false);
});

test('generateReportSchema', () => {
    assert.equal(generateReportSchema.safeParse({ jobDescription: 'Backend Engineer' }).success, true);
    assert.equal(generateReportSchema.safeParse({ jobDescription: '' }).success, false, 'job description required');
    assert.equal(generateReportSchema.safeParse({}).success, false, 'job description required when key missing');

    // selfDescription is optional and defaults to ''
    const result = generateReportSchema.safeParse({ jobDescription: 'Backend Engineer' });
    assert.equal(result.data.selfDescription, '');
});
