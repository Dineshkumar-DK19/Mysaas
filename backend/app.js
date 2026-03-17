const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const authRoutes = require('./src/routes/auth.routes');
const whatsappRoutes = require('./src/routes/whatsapp.routes');
const conversationRoutes = require('./src/routes/conversation.routes');
const aiRoutes = require('./src/routes/ai.routes');
const messageRoutes = require('./src/routes/message.routes');
const businessRoutes = require("./src/routes/business.routes");
const errorMiddleware = require('./src/middleware/error.middleware');
const securityMiddleware = require('./src/middleware/security.middleware');
const { apiLimiter } = require('./src/middleware/rateLimiter.middleware');
const { sanitizeInput, sanitizeQuery } = require('./src/middleware/sanitize.middleware');
const logger = require('./src/utils/logger');

const app = express();

// Security middleware (must be first)
if (process.env.NODE_ENV === 'production') {
  app.use(securityMiddleware);
}

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging
const requestLogger = require('./src/middleware/requestLogger.middleware');
if (process.env.NODE_ENV === 'production') {
  app.use(requestLogger);
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
} else {
  app.use(morgan('dev'));
}

// Request ID for tracing
const requestId = require('./src/middleware/requestId.middleware');
app.use(requestId);

// Input sanitization
app.use(sanitizeInput);
app.use(sanitizeQuery);

// Request timeout
const timeout = require('./src/middleware/timeout.middleware');
app.use(timeout(30000)); // 30 seconds

// Rate limiting
app.use('/api', apiLimiter);

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next(err);
});

// Health checks
const { healthCheck, readinessCheck } = require('./src/controllers/health.controller');
app.get('/api/health', healthCheck);
app.get('/api/ready', readinessCheck);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/business", businessRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware
app.use(errorMiddleware);

module.exports = app;
