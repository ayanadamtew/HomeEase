const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Returns 400 with error array if validation fails.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0].msg;
        return res.status(400).json({
            message: `Validation failed: ${firstError}`,
            errors: errors.array()
        });
    }
    next();
};

module.exports = validate;
