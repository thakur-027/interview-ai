const { z } = require('zod');

const registerSchema = z.object({
    username: z.string().trim().min(2, 'Username must be at least 2 characters'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
