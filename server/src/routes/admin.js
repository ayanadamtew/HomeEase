const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Apply Authentication and strict Role-Based Access Control to ALL admin routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN')); // Only ADMINs can hit these endpoints

// ─── KYC Verification Routes ──────────────────────────────────────
router.get('/kyc', adminController.getPendingKycRequests);
router.put('/kyc/:userId', adminController.updateKycStatus);

module.exports = router;
