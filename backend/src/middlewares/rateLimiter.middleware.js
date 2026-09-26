const rateLimit = require('express-rate-limit');

// Separate instances (not a shared singleton) so brute-forcing login doesn't
// also burn through someone's registration budget, and vice versa.
function makeAuthLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many attempts. Please try again in a few minutes.' },
    });
}

const registerLimiter = makeAuthLimiter();
const loginLimiter = makeAuthLimiter();

// AI generation routes: these call Gemini + Puppeteer, both expensive
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many AI requests. Please try again later.' },
});

module.exports = { registerLimiter, loginLimiter, aiLimiter };
