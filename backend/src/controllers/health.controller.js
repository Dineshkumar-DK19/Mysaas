const mongoose = require('mongoose');
const { connection: redisConnection } = require('../config/redis');
const logger = require('../utils/logger');

exports.healthCheck = async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.database = 'connected';
    } else {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    logger.error('MongoDB health check failed:', error);
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Check Redis connection
  try {
    await redisConnection.ping();
    health.services.redis = 'connected';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    health.services.redis = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};

exports.readinessCheck = async (req, res) => {
  let ready = true;
  const checks = {
    database: false,
    redis: false,
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      checks.database = true;
    }
  } catch (error) {
    logger.error('MongoDB readiness check failed:', error);
  }

  // Check Redis
  try {
    await redisConnection.ping();
    checks.redis = true;
  } catch (error) {
    logger.error('Redis readiness check failed:', error);
  }

  ready = checks.database && checks.redis;

  if (ready) {
    res.status(200).json({ status: 'ready', checks });
  } else {
    res.status(503).json({ status: 'not ready', checks });
  }
};
