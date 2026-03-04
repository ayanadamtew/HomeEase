/**
 * Global error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Prisma known request error
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({
            message: `A record with this ${field} already exists.`,
        });
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Record not found.' });
    }

    // Validation errors (express-validator)
    if (err.array && typeof err.array === 'function') {
        return res.status(400).json({ errors: err.array() });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
