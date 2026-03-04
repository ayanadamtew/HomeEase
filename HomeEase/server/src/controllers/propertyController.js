const prisma = require('../config/db');

/**
 * POST /api/properties
 * Create a new property listing (Landlord only).
 */
const createProperty = async (req, res, next) => {
    try {
        const {
            title, description, pricePerMonth, location, city, state,
            latitude, longitude, bedrooms, bathrooms, area, amenities, images,
        } = req.body;

        const property = await prisma.property.create({
            data: {
                landlordId: req.user.id,
                title,
                description,
                pricePerMonth,
                location,
                city,
                state,
                latitude: latitude || null,
                longitude: longitude || null,
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                area: area ? parseInt(area) : null,
                amenities: amenities || [],
                images: images && images.length > 0 ? {
                    create: images.map((img, index) => ({
                        imageUrl: img.url || img.imageUrl,
                        isPrimary: index === 0,
                        displayOrder: index,
                    })),
                } : undefined,
            },
            include: { images: true, landlord: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });

        res.status(201).json({ message: 'Property listed successfully', property });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/properties
 * Get all properties with search & filter support.
 */
const getProperties = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 12, search, city, state,
            minPrice, maxPrice, bedrooms, bathrooms, amenities, status, sortBy,
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build filter conditions
        const where = { status: status || 'AVAILABLE' };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (city) where.city = { contains: city, mode: 'insensitive' };
        if (state) where.state = { contains: state, mode: 'insensitive' };
        if (minPrice) where.pricePerMonth = { ...where.pricePerMonth, gte: parseFloat(minPrice) };
        if (maxPrice) where.pricePerMonth = { ...where.pricePerMonth, lte: parseFloat(maxPrice) };
        if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
        if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };

        // Sort options
        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'price_asc') orderBy = { pricePerMonth: 'asc' };
        else if (sortBy === 'price_desc') orderBy = { pricePerMonth: 'desc' };
        else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
        else if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    images: { orderBy: { displayOrder: 'asc' } },
                    landlord: { select: { id: true, name: true, avatarUrl: true } },
                    _count: { select: { reviews: true } },
                },
            }),
            prisma.property.count({ where }),
        ]);

        // Calculate average ratings
        const propertiesWithRatings = await Promise.all(
            properties.map(async (prop) => {
                const avgRating = await prisma.review.aggregate({
                    where: { propertyId: prop.id },
                    _avg: { rating: true },
                });
                return { ...prop, avgRating: avgRating._avg.rating || 0 };
            })
        );

        res.json({
            properties: propertiesWithRatings,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/properties/:id
 * Get a single property with full details.
 */
const getPropertyById = async (req, res, next) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: req.params.id },
            include: {
                images: { orderBy: { displayOrder: 'asc' } },
                landlord: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                reviews: {
                    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true } },
            },
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
            where: { propertyId: property.id },
            _avg: { rating: true },
        });

        res.json({ property: { ...property, avgRating: avgRating._avg.rating || 0 } });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/properties/:id
 * Update a property (owner only).
 */
const updateProperty = async (req, res, next) => {
    try {
        const existing = await prisma.property.findUnique({ where: { id: req.params.id } });

        if (!existing) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (existing.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        const {
            title, description, pricePerMonth, location, city, state,
            latitude, longitude, bedrooms, bathrooms, area, amenities, status,
        } = req.body;

        const property = await prisma.property.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(pricePerMonth !== undefined && { pricePerMonth }),
                ...(location && { location }),
                ...(city && { city }),
                ...(state && { state }),
                ...(latitude !== undefined && { latitude }),
                ...(longitude !== undefined && { longitude }),
                ...(bedrooms !== undefined && { bedrooms: parseInt(bedrooms) }),
                ...(bathrooms !== undefined && { bathrooms: parseInt(bathrooms) }),
                ...(area !== undefined && { area: parseInt(area) }),
                ...(amenities && { amenities }),
                ...(status && { status }),
            },
            include: {
                images: { orderBy: { displayOrder: 'asc' } },
                landlord: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });

        res.json({ message: 'Property updated successfully', property });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/properties/:id
 * Delete a property (owner or admin only).
 */
const deleteProperty = async (req, res, next) => {
    try {
        const existing = await prisma.property.findUnique({ where: { id: req.params.id } });

        if (!existing) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (existing.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this property' });
        }

        await prisma.property.delete({ where: { id: req.params.id } });
        res.json({ message: 'Property deleted successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/properties/:id/images
 * Add images to a property.
 */
const addPropertyImages = async (req, res, next) => {
    try {
        const existing = await prisma.property.findUnique({ where: { id: req.params.id } });

        if (!existing) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (existing.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { images } = req.body; // [{ imageUrl, isPrimary, displayOrder }]

        const created = await prisma.propertyImage.createMany({
            data: images.map((img) => ({
                propertyId: req.params.id,
                imageUrl: img.imageUrl || img.url,
                isPrimary: img.isPrimary || false,
                displayOrder: img.displayOrder || 0,
            })),
        });

        res.status(201).json({ message: `${created.count} image(s) added`, count: created.count });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/properties/:id/images/:imageId
 * Delete a property image.
 */
const deletePropertyImage = async (req, res, next) => {
    try {
        const property = await prisma.property.findUnique({ where: { id: req.params.id } });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.landlordId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.propertyImage.delete({ where: { id: req.params.imageId } });
        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/properties/my-listings
 * Get all properties owned by the current user.
 */
const getMyListings = async (req, res, next) => {
    try {
        const properties = await prisma.property.findMany({
            where: { landlordId: req.user.id },
            include: {
                images: { orderBy: { displayOrder: 'asc' } },
                _count: { select: { reviews: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ properties });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    addPropertyImages,
    deletePropertyImage,
    getMyListings,
};
