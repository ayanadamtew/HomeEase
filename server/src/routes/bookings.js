const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// ─── Validation ──────────────────────────────────────────────────
const bookingValidation = [
    body('serviceProfileId').notEmpty().withMessage('Service profile ID is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
];

const statusValidation = [
    body('status').isIn(['CONFIRMED', 'CANCELLED', 'COMPLETED']).withMessage('Invalid status'),
];

// ─── All Routes Protected ────────────────────────────────────────
router.post('/', authenticate, bookingValidation, validate, bookingController.createBooking);
router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.put('/:id/status', authenticate, statusValidation, validate, bookingController.updateBookingStatus);

module.exports = router;
