const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Returns 400 with error array if validation fails.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = validate;
