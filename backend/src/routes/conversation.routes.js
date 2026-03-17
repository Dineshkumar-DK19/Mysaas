const express = require('express');
const auth = require('../middleware/auth.middleware');
const { messageLimiter } = require('../middleware/rateLimiter.middleware');
const { validateObjectId, validatePhoneNumber } = require('../middleware/validate.middleware');
const {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  receiveTestInbound
} = require('../controllers/conversation.controller');

const router = express.Router();

router.get('/', auth, getConversations);
router.get('/:conversationId', auth, validateObjectId, getConversation); // Get conversation with details
router.get('/:conversationId/messages', auth, validateObjectId, getMessages); // Get messages only
router.post('/send', auth, messageLimiter, validatePhoneNumber, sendMessage);           // send outbound (dashboard)
router.post('/test/inbound', auth, messageLimiter, validatePhoneNumber, receiveTestInbound); // simulate inbound via dashboard

module.exports = router;
