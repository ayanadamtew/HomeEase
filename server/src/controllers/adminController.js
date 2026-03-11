const prisma = require('../config/db');

/**
 * GET /api/admin/kyc
 * List all users with PENDING verification status.
 */
const getPendingKycRequests = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: { verificationStatus: 'PENDING' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                identityDocumentUrl: true,
                verificationStatus: true,
                createdAt: true,
            },
            orderBy: { updatedAt: 'asc' }
        });

        res.json({ users });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/admin/kyc/:userId
 * Approve or Reject a user's KYC documentation.
 */
const updateKycStatus = async (req, res, next) => {
    try {
        const { status } = req.body; // 'APPROVED' or 'REJECTED'

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
        }

        const user = await prisma.user.update({
            where: { id: req.params.userId },
            data: {
                verificationStatus: status,
                isVerified: status === 'APPROVED' // Keep legacy flag synced
            },
            select: { id: true, name: true, email: true, verificationStatus: true }
        });

        res.json({ message: `User KYC ${status.toLowerCase()}`, user });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPendingKycRequests,
    updateKycStatus
};
