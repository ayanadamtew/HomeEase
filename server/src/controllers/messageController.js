const prisma = require('../config/db');

/**
 * POST /api/messages/conversations
 * Start a new conversation (or return existing one).
 */
const startConversation = async (req, res, next) => {
    try {
        const { recipientId, propertyId, bookingId } = req.body;

        if (recipientId === req.user.id) {
            return res.status(400).json({ message: 'Cannot start a conversation with yourself' });
        }

        // Check if conversation already exists between these two users for this context
        const existing = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { participantOneId: req.user.id, participantTwoId: recipientId },
                    { participantOneId: recipientId, participantTwoId: req.user.id },
                ],
                ...(propertyId && { propertyId }),
                ...(bookingId && { bookingId }),
            },
            include: {
                participantOne: { select: { id: true, name: true, avatarUrl: true } },
                participantTwo: { select: { id: true, name: true, avatarUrl: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });

        if (existing) {
            const normalized = {
                ...existing,
                participants: [existing.participantOne, existing.participantTwo]
            };
            return res.json({ conversation: normalized, isNew: false });
        }

        const conversation = await prisma.conversation.create({
            data: {
                participantOneId: req.user.id,
                participantTwoId: recipientId,
                propertyId: propertyId || null,
                bookingId: bookingId || null,
            },
            include: {
                participantOne: { select: { id: true, name: true, avatarUrl: true } },
                participantTwo: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        const normalized = {
            ...conversation,
            participants: [conversation.participantOne, conversation.participantTwo]
        };

        res.status(201).json({ conversation: normalized, isNew: true });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/messages/conversations
 * Get all conversations for the current user.
 */
const getConversations = async (req, res, next) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participantOneId: req.user.id },
                    { participantTwoId: req.user.id },
                ],
            },
            include: {
                participantOne: { select: { id: true, name: true, avatarUrl: true } },
                participantTwo: { select: { id: true, name: true, avatarUrl: true } },
                property: { select: { id: true, title: true } },
                booking: { select: { id: true, status: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Add unread count for each conversation
        const withUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: req.user.id },
                        isRead: false,
                    },
                });
                return {
                    ...conv,
                    unreadCount,
                    participants: [conv.participantOne, conv.participantTwo]
                };
            })
        );

        res.json({ conversations: withUnread });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/messages/:conversationId
 * Send a message in a conversation.
 */
const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { conversationId } = req.params;

        // Verify conversation exists and user is a participant
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (conversation.participantOneId !== req.user.id && conversation.participantTwoId !== req.user.id) {
            return res.status(403).json({ message: 'Not a participant of this conversation' });
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: req.user.id,
                content,
            },
            include: {
                sender: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        res.status(201).json({ message: message });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/messages/:conversationId
 * Get all messages in a conversation.
 */
const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Verify participation
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (conversation.participantOneId !== req.user.id && conversation.participantTwoId !== req.user.id) {
            return res.status(403).json({ message: 'Not a participant of this conversation' });
        }

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { conversationId },
                skip,
                take,
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: { select: { id: true, name: true, avatarUrl: true } },
                },
            }),
            prisma.message.count({ where: { conversationId } }),
        ]);

        // Mark unread messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: req.user.id },
                isRead: false,
            },
            data: { isRead: true },
        });

        res.json({
            messages,
            pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    startConversation,
    getConversations,
    sendMessage,
    getMessages,
};
