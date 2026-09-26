/**
 * @name validate
 * @description Generic middleware factory that validates req.body against a zod schema.
 *              On success, req.body is replaced with the parsed (typed) data.
 *              On failure, responds 400 with a flat list of field errors.
 * @param {import('zod').ZodSchema} schema
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        req.body = result.data;
        next();
    };
}

module.exports = validate;
