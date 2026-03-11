const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    },
});

// Single image upload route
router.post('/', authenticate, upload.single('image'), uploadController.uploadImage);

module.exports = router;
