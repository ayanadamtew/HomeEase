const prisma = require('../config/db');

/**
 * POST /api/services/profile
 * Create or update the current user's service profile.
 */
const createOrUpdateProfile = async (req, res, next) => {
    try {
        const { categoryId, serviceType, headline, bio, hourlyRate, dailyRate, availability, yearsExperience, serviceArea, isActive } = req.body;

        const existing = await prisma.serviceProfile.findUnique({ where: { userId: req.user.id } });

        let profile;
        if (existing) {
            profile = await prisma.serviceProfile.update({
                where: { userId: req.user.id },
                data: {
                    ...(serviceType && { serviceType }),
                    ...(categoryId !== undefined && { categoryId: categoryId || null }),
                    ...(headline && { headline }),
                    ...(bio && { bio }),
                    ...(hourlyRate !== undefined && { hourlyRate }),
                    ...(dailyRate !== undefined && { dailyRate }),
                    ...(availability && { availability }),
                    ...(yearsExperience !== undefined && { yearsExperience: parseInt(yearsExperience) }),
                    ...(serviceArea && { serviceArea }),
                    ...(isActive !== undefined && { isActive: Boolean(isActive) }),
                },
                include: { category: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            });
        } else {
            profile = await prisma.serviceProfile.create({
                data: {
                    userId: req.user.id,
                    serviceType: serviceType || 'General Service',
                    categoryId: categoryId || null,
                    headline,
                    bio,
                    hourlyRate,
                    dailyRate: dailyRate || null,
                    availability: availability || {},
                    yearsExperience: yearsExperience ? parseInt(yearsExperience) : 0,
                    serviceArea,
                    isActive: isActive !== undefined ? Boolean(isActive) : true,
                },
                include: { category: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            });

            // Update user role to PROVIDER if they're a CLIENT
            if (req.user.role === 'CLIENT') {
                await prisma.user.update({ where: { id: req.user.id }, data: { role: 'PROVIDER' } });
            }
        }

        res.status(existing ? 200 : 201).json({
            message: existing ? 'Profile updated' : 'Profile created',
            profile,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/services/providers
 * Search and list service providers with filters.
 */
const getProviders = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, search, category, minRate, maxRate, serviceArea, sortBy } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = { isActive: true };

        if (search) {
            where.OR = [
                { serviceType: { contains: search, mode: 'insensitive' } },
                { headline: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (category) {
            where.OR = [
                { serviceType: { contains: category, mode: 'insensitive' } },
                { category: { name: { contains: category, mode: 'insensitive' } } },
            ];
        }

        if (minRate) where.hourlyRate = { ...where.hourlyRate, gte: parseFloat(minRate) };
        if (maxRate) where.hourlyRate = { ...where.hourlyRate, lte: parseFloat(maxRate) };
        if (serviceArea) where.serviceArea = { contains: serviceArea, mode: 'insensitive' };

        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'rate_asc') orderBy = { hourlyRate: 'asc' };
        else if (sortBy === 'rate_desc') orderBy = { hourlyRate: 'desc' };
        else if (sortBy === 'experience') orderBy = { yearsExperience: 'desc' };

        const [providers, total] = await Promise.all([
            prisma.serviceProfile.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                    category: true,
                    _count: { select: { reviews: true, bookings: true } },
                },
            }),
            prisma.serviceProfile.count({ where }),
        ]);

        // Attach average ratings
        const providersWithRatings = await Promise.all(
            providers.map(async (prov) => {
                const avgRating = await prisma.review.aggregate({
                    where: { serviceProfileId: prov.id },
                    _avg: { rating: true },
                });
                return { ...prov, avgRating: avgRating._avg.rating || 0 };
            })
        );

        res.json({
            providers: providersWithRatings,
            pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/services/providers/:id
 * Get a single provider's full profile.
 */
const getProviderById = async (req, res, next) => {
    try {
        const profile = await prisma.serviceProfile.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                category: true,
                reviews: {
                    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true, bookings: true } },
            },
        });

        if (!profile) {
            return res.status(404).json({ message: 'Service provider not found' });
        }

        const avgRating = await prisma.review.aggregate({
            where: { serviceProfileId: profile.id },
            _avg: { rating: true },
        });

        res.json({ provider: { ...profile, avgRating: avgRating._avg.rating || 0 } });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/services/profile/me
 * Get the current user's own service profile.
 */
const getMyProfile = async (req, res, next) => {
    try {
        const profile = await prisma.serviceProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                category: true,
                _count: { select: { reviews: true, bookings: true } },
            },
        });
        if (!profile) {
            return res.status(404).json({ message: 'No profile found' });
        }
        res.json({ profile });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/services/categories
 * Get all service categories.
 */
const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.serviceCategory.findMany({
            include: { _count: { select: { profiles: true } } },
            orderBy: { name: 'asc' },
        });

        res.json({ categories });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/services/profile/toggle
 * Toggle the provider's active status.
 */
const toggleActive = async (req, res, next) => {
    try {
        const profile = await prisma.serviceProfile.findUnique({ where: { userId: req.user.id } });

        if (!profile) {
            return res.status(404).json({ message: 'You do not have a service profile' });
        }

        const updated = await prisma.serviceProfile.update({
            where: { userId: req.user.id },
            data: { isActive: !profile.isActive },
        });

        res.json({ message: `Profile ${updated.isActive ? 'activated' : 'deactivated'}`, isActive: updated.isActive });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createOrUpdateProfile,
    getMyProfile,
    getProviders,
    getProviderById,
    getCategories,
    toggleActive,
};
