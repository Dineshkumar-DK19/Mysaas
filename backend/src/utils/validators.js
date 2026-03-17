/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
function isValidPhoneNumber(phone) {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's between 10 and 15 digits (international format)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validate required fields in an object
 */
function validateRequired(data, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  validateRequired,
  sanitizeString,
};
