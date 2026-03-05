const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// ─── Validation Rules ────────────────────────────────────────────
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 100 })
        .withMessage('Name must be at most 100 characters'),
    body('role')
        .optional()
        .isIn(['CLIENT', 'PROVIDER', 'LANDLORD'])
        .withMessage('Role must be CLIENT, PROVIDER, or LANDLORD'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters'),
];

// ─── Routes ──────────────────────────────────────────────────────

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/kyc', authenticate, authController.submitKyc);
router.put(
    '/change-password',
    authenticate,
    changePasswordValidation,
    validate,
    authController.changePassword
);

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

module.exports = router;
