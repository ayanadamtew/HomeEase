const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

// ─── All Routes Protected ────────────────────────────────────────
router.post('/conversations', authenticate, messageController.startConversation);
router.get('/conversations', authenticate, messageController.getConversations);
router.post('/:conversationId', authenticate,
    body('content').trim().notEmpty().withMessage('Message cannot be empty'),
    validate,
    messageController.sendMessage
);
router.get('/:conversationId', authenticate, messageController.getMessages);

module.exports = router;
