const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Generate a JWT token for a user.
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Sanitize user object for response (remove sensitive fields).
 */
const sanitizeUser = (user) => {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
};

/**
 * POST /api/auth/register
 * Register a new user with email and password.
 */
const register = async (req, res, next) => {
    try {
        const { email, password, name, phone, role } = req.body;

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // Only allow CLIENT, PROVIDER, LANDLORD during self-registration
        const allowedRoles = ['CLIENT', 'PROVIDER', 'LANDLORD'];
        const userRole = allowedRoles.includes(role) ? role : 'CLIENT';

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                phone,
                role: userRole,
            },
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: sanitizeUser(user),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/login
 * Authenticate a user with email and password.
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Check if user has a password (could be OAuth-only)
        if (!user.passwordHash) {
            return res.status(401).json({
                message: 'This account uses Google login. Please sign in with Google.',
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: sanitizeUser(user),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                serviceProfile: {
                    include: { category: true },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ user: sanitizeUser(user) });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile.
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
                ...(avatarUrl !== undefined && { avatarUrl }),
            },
        });

        res.json({
            message: 'Profile updated successfully',
            user: sanitizeUser(user),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/auth/kyc
 * Submit KYC documents for identity verification.
 */
const submitKyc = async (req, res, next) => {
    try {
        const { identityDocumentUrl } = req.body;

        if (!identityDocumentUrl) {
            return res.status(400).json({ message: 'Identity document URL is required' });
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                identityDocumentUrl,
                verificationStatus: 'PENDING',
            },
        });

        res.json({
            message: 'KYC documents submitted successfully. Pending admin approval.',
            user: sanitizeUser(user),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/auth/change-password
 * Change the authenticated user's password.
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user.passwordHash) {
            return res.status(400).json({
                message: 'Cannot change password for Google-only accounts.',
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newHash },
        });

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        next(err);
    }
};

/**
 * Handle Google OAuth callback — generate JWT and redirect to frontend.
 */
const googleCallback = (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    submitKyc,
    googleCallback,
};
