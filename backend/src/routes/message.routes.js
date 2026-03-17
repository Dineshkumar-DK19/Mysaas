const express = require('express');
const auth = require('../middleware/auth.middleware');
const { sendMessage } = require('../controllers/conversation.controller');

const router = express.Router();
router.post('/send', auth, sendMessage);
module.exports = router;
