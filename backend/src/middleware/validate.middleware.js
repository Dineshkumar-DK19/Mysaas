const validator = require('validator');

/**
 * Validate email format
 */
const validateEmail = (req, res, next) => {
  if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (req, res, next) => {
  const { id, conversationId, ruleId } = req.params;
  const idToValidate = id || conversationId || ruleId;

  if (idToValidate && !validator.isMongoId(idToValidate)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

/**
 * Validate phone number format
 */
const validatePhoneNumber = (req, res, next) => {
  if (req.body.toNumber || req.body.from) {
    const phone = req.body.toNumber || req.body.from;
    // Remove all non-digit characters for validation
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 15) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
  }
  next();
};

module.exports = {
  validateEmail,
  validateObjectId,
  validatePhoneNumber,
};
