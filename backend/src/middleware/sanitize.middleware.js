const validator = require('validator');

/**
 * Sanitize request body to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'string') {
            // Remove HTML tags and escape special characters
            obj[key] = validator.escape(validator.stripLow(obj[key], true));
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      }
    };
    sanitizeObject(req.body);
  }
  next();
};

/**
 * Sanitize query parameters
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (req.query.hasOwnProperty(key) && typeof req.query[key] === 'string') {
        req.query[key] = validator.escape(validator.stripLow(req.query[key], true));
      }
    }
  }
  next();
};

module.exports = {
  sanitizeInput,
  sanitizeQuery,
};
