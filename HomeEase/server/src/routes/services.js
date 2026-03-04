const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');

const router = express.Router();

// ─── Validation ──────────────────────────────────────────────────
const profileValidation = [
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('headline').trim().notEmpty().withMessage('Headline is required'),
    body('bio').trim().notEmpty().withMessage('Bio is required'),
    body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
    body('serviceArea').trim().notEmpty().withMessage('Service area is required'),
];

// ─── Public Routes ───────────────────────────────────────────────
router.get('/categories', serviceController.getCategories);
router.get('/providers', serviceController.getProviders);
router.get('/providers/:id', serviceController.getProviderById);

// ─── Protected Routes ────────────────────────────────────────────
router.post('/profile', authenticate, profileValidation, validate, serviceController.createOrUpdateProfile);
router.put('/profile', authenticate, serviceController.createOrUpdateProfile);
router.put('/profile/toggle', authenticate, serviceController.toggleActive);

module.exports = router;
