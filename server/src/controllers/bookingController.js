const prisma = require('../config/db');

/**
 * POST /api/bookings
 * Create a new booking request.
 */
const createBooking = async (req, res, next) => {
    try {
        const { serviceProfileId, startTime, endTime, notes } = req.body;

        // Verify the service profile exists and is active
        const profile = await prisma.serviceProfile.findUnique({
            where: { id: serviceProfileId },
        });

        if (!profile) {
            return res.status(404).json({ message: 'Service provider not found' });
        }
        if (!profile.isActive) {
            return res.status(400).json({ message: 'This provider is currently unavailable' });
        }
        if (profile.userId === req.user.id) {
            return res.status(400).json({ message: 'You cannot book your own service' });
        }

        // Calculate total price based on hours
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
        const totalPrice = parseFloat(profile.hourlyRate) * hours;

        const booking = await prisma.booking.create({
            data: {
                clientId: req.user.id,
                serviceProfileId,
                startTime: start,
                endTime: end,
                totalPrice,
                notes,
                status: 'PENDING',
            },
        });

        // Calculate a 10% platform fee
        const platformFee = totalPrice * 0.10;

        const transaction = await prisma.transaction.create({
            data: {
                amount: totalPrice,
                platformFee,
                type: 'SERVICE_BOOKING',
                status: 'HELD_IN_ESCROW',
                payerId: req.user.id,
                payeeId: profile.userId,
                bookingId: booking.id,
            }
        });

        const bookingWithDetails = await prisma.booking.findUnique({
            where: { id: booking.id },
            include: {
                serviceProfile: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true } },
                        category: true,
                    },
                },
                client: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });

        res.status(201).json({ message: 'Booking request sent (Funds held in escrow)', booking: bookingWithDetails, transaction });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/bookings
 * Get bookings for the current user (as client or provider).
 */
const getBookings = async (req, res, next) => {
    try {
        const { status, role = 'client', page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        let where = {};

        if (role === 'provider') {
            // Get bookings where user is the service provider
            const profile = await prisma.serviceProfile.findUnique({ where: { userId: req.user.id } });
            if (!profile) {
                return res.json({ bookings: [], pagination: { page: 1, limit: take, total: 0, totalPages: 0 } });
            }
            where.serviceProfileId = profile.id;
        } else {
            where.clientId = req.user.id;
        }

        if (status) where.status = status;

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: { select: { id: true, name: true, email: true, avatarUrl: true } },
                    serviceProfile: {
                        include: {
                            user: { select: { id: true, name: true, avatarUrl: true } },
                            category: true,
                        },
                    },
                },
            }),
            prisma.booking.count({ where }),
        ]);

        res.json({
            bookings,
            pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/bookings/:id/status
 * Update booking status (provider: confirm/cancel, client: cancel).
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { serviceProfile: true },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Authorization: client can cancel, provider can confirm/cancel/complete
        const isClient = booking.clientId === req.user.id;
        const isProvider = booking.serviceProfile.userId === req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isClient && !isProvider && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to modify this booking' });
        }

        // Validate status transitions
        const clientAllowed = ['CANCELLED'];
        const providerAllowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];

        if (isClient && !clientAllowed.includes(status)) {
            return res.status(400).json({ message: 'You can only cancel a booking' });
        }
        if (isProvider && !providerAllowed.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Allowed: ${providerAllowed.join(', ')}` });
        }

        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                client: { select: { id: true, name: true, email: true } },
                serviceProfile: {
                    include: {
                        user: { select: { id: true, name: true } },
                        category: true,
                    },
                },
                transaction: true,
            },
        });

        let message = `Booking ${status.toLowerCase()}`;

        // Escrow Release Logic
        if (status === 'COMPLETED' && updated.transaction) {
            await prisma.transaction.update({
                where: { id: updated.transaction.id },
                data: { status: 'RELEASED' }
            });
            message += ' and funds released from escrow';
        } else if (status === 'CANCELLED' && updated.transaction) {
            await prisma.transaction.update({
                where: { id: updated.transaction.id },
                data: { status: 'REFUNDED' }
            });
            message += ' and funds refunded';
        }

        res.json({ message, booking: updated });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/bookings/:id
 * Get a single booking.
 */
const getBookingById = async (req, res, next) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.id },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                serviceProfile: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                        category: true,
                    },
                },
                reviews: true,
            },
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow client, provider, or admin to view
        const isClient = booking.clientId === req.user.id;
        const isProvider = booking.serviceProfile.userId === req.user.id;
        if (!isClient && !isProvider && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({ booking });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createBooking,
    getBookings,
    updateBookingStatus,
    getBookingById,
};
