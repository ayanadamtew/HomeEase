const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

// ─── Validation ──────────────────────────────────────────────────
const propertyValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('pricePerMonth').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
];

// ─── Public Routes ───────────────────────────────────────────────
router.get('/', propertyController.getProperties);

// ─── Protected Routes ────────────────────────────────────────────
router.post('/', authenticate, authorizeRoles('LANDLORD', 'ADMIN'), propertyValidation, validate, propertyController.createProperty);
router.get('/user/my-listings', authenticate, propertyController.getMyListings);

// ─── Param Routes (must come after static routes) ────────────────
router.get('/:id', propertyController.getPropertyById);
router.put('/:id', authenticate, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);

// ─── Image Management ────────────────────────────────────────────
router.post('/:id/images', authenticate, propertyController.addPropertyImages);
router.delete('/:id/images/:imageId', authenticate, propertyController.deletePropertyImage);

module.exports = router;
