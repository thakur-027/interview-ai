const { z } = require('zod');

// Note: this runs after multer, so req.body only has the text fields
// (resume file itself is checked separately via req.file in the controller).
const generateReportSchema = z.object({
    selfDescription: z.string().trim().max(3000, 'Self description is too long').optional().default(''),
    jobDescription: z.string().trim().min(1, 'Job description is required').max(5000, 'Job description is too long'),
});

module.exports = { generateReportSchema };
