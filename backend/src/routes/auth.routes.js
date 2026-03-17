const express = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { validateEmail } = require('../middleware/validate.middleware');
const router = express.Router();

router.post('/register', authLimiter, validateEmail, register);
router.post('/login', authLimiter, validateEmail, login);
router.get('/me', authMiddleware, me);

module.exports = router;
