function notFound(req, res, next) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express 5 requires exactly 4 args for this to be recognized as an error handler
function errorHandler(err, req, res, next) {
    console.error('Unhandled error:', err);

    // Multer file-size / file-type errors already have a message worth surfacing
    if (err.name === 'MulterError' || /Only PDF and DOCX/.test(err.message || '')) {
        return res.status(400).json({ message: err.message });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: statusCode === 500 ? 'Something went wrong. Please try again.' : err.message,
    });
}

module.exports = { notFound, errorHandler };
