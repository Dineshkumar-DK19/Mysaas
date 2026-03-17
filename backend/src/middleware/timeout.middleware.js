/**
 * Request timeout middleware
 * Prevents requests from hanging indefinitely
 */
const timeout = (ms = 30000) => {
  return (req, res, next) => {
    req.setTimeout(ms, () => {
      if (!res.headersSent) {
        res.status(408).json({ message: 'Request timeout' });
      }
    });
    next();
  };
};

module.exports = timeout;
