const cloudinary = require('../config/cloudinary');

/**
 * POST /api/upload
 * Upload a single image to Cloudinary.
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Convert buffer to data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

        const results = await cloudinary.uploader.upload(dataURI, {
            folder: 'homeease/properties',
            resource_type: 'auto',
        });

        res.json({
            url: results.secure_url,
            public_id: results.public_id,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadImage,
};
