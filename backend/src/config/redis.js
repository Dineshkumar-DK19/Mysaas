const IORedis = require('ioredis');
const logger = require('../utils/logger');

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
  enableReadyCheck: false, // prevents some connection delays
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      logger.warn('Redis READONLY error, reconnecting...');
      return true;
    }
    return false;
  },
});

connection.on('connect', () => {
  logger.info('Redis connected');
});

connection.on('ready', () => {
  logger.info('Redis ready');
});

connection.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

connection.on('close', () => {
  logger.warn('Redis connection closed');
});

connection.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

module.exports = {
  connection
};