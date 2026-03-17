const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { isValidEmail, validateRequired } = require('../utils/validators');

const signToken = user => jwt.sign({
    id: user._id
}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

// Helper to remove password from user object
const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        const validation = validateRequired(req.body, ['email', 'password']);
        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Missing required fields',
                missing: validation.missing
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.json({
            token: signToken(user),
            user: sanitizeUser(user)
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        res.json({
            token: signToken(user),
            user: sanitizeUser(user)
        });
    } catch (err) {
        next(err);
    }
};

exports.me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id || req.user.id).populate('business');
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.json({
            user: sanitizeUser(user)
        });
    } catch (err) {
        next(err);
    }
};