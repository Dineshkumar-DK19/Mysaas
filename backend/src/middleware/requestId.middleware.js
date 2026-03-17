/**
 * Add unique request ID to each request for tracing
 */
const requestId = (req, res, next) => {
  // Generate simple ID if uuid not available
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  req.id = req.headers['x-request-id'] || generateId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = requestId;
