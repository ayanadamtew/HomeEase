const passport = require('passport');

/**
 * Authenticate using JWT Bearer token.
 * Attaches user object to req.user on success.
 */
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Role-based access control middleware.
 * Usage: authorize('ADMIN', 'LANDLORD')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${roles.join(', ')}`,
            });
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles };
