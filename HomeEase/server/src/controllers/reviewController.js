const prisma = require('../config/db');

/**
 * POST /api/reviews
 * Create a review for a property or service provider.
 */
const createReview = async (req, res, next) => {
    try {
        const { propertyId, serviceProfileId, bookingId, rating, comment } = req.body;

        // Must review either a property or a service profile (not both)
        if (!propertyId && !serviceProfileId) {
            return res.status(400).json({ message: 'Must specify propertyId or serviceProfileId' });
        }
        if (propertyId && serviceProfileId) {
            return res.status(400).json({ message: 'Cannot review both a property and service at once' });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check for duplicate reviews
        const existingReview = await prisma.review.findFirst({
            where: {
                authorId: req.user.id,
                ...(propertyId && { propertyId }),
                ...(serviceProfileId && { serviceProfileId }),
                ...(bookingId && { bookingId }),
            },
        });

        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this item' });
        }

        // If reviewing a service via a booking, verify the booking is completed
        if (bookingId) {
            const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
            if (!booking || booking.status !== 'COMPLETED') {
                return res.status(400).json({ message: 'Can only review completed bookings' });
            }
            if (booking.clientId !== req.user.id) {
                return res.status(403).json({ message: 'Only the client can review a booking' });
            }
        }

        const review = await prisma.review.create({
            data: {
                authorId: req.user.id,
                propertyId: propertyId || null,
                serviceProfileId: serviceProfileId || null,
                bookingId: bookingId || null,
                rating: parseInt(rating),
                comment,
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        res.status(201).json({ message: 'Review submitted', review });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/reviews
 * Get reviews for a property or service provider.
 */
const getReviews = async (req, res, next) => {
    try {
        const { propertyId, serviceProfileId, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};
        if (propertyId) where.propertyId = propertyId;
        if (serviceProfileId) where.serviceProfileId = serviceProfileId;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, name: true, avatarUrl: true } },
                },
            }),
            prisma.review.count({ where }),
        ]);

        // Aggregate stats
        const stats = await prisma.review.aggregate({
            where,
            _avg: { rating: true },
            _count: { rating: true },
        });

        res.json({
            reviews,
            stats: { avgRating: stats._avg.rating || 0, totalReviews: stats._count.rating },
            pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/reviews/:id
 * Delete a review (author or admin only).
 */
const deleteReview = async (req, res, next) => {
    try {
        const review = await prisma.review.findUnique({ where: { id: req.params.id } });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (review.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await prisma.review.delete({ where: { id: req.params.id } });
        res.json({ message: 'Review deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createReview,
    getReviews,
    deleteReview,
};
