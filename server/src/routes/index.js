const express = require('express');

const router = express.Router();

// Health check
router.get('/', (req, res) => {
    res.json({ message: 'HomeEase API is running', version: '1.0.0' });
});

// Mount route modules
router.use('/auth', require('./auth'));
router.use('/properties', require('./properties'));
router.use('/services', require('./services'));
router.use('/bookings', require('./bookings'));
router.use('/reviews', require('./reviews'));
router.use('/messages', require('./messages'));
router.use('/admin', require('./admin'));

module.exports = router;
