const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// ─── Validation ──────────────────────────────────────────────────
const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
];

// ─── Routes ──────────────────────────────────────────────────────
router.get('/', reviewController.getReviews);
router.post('/', authenticate, reviewValidation, validate, reviewController.createReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
