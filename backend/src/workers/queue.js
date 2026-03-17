// src/workers/queue.js
const { Queue } = require("bullmq");
const { connection } = require("../config/redis");

const messageQueue = new Queue("messageQueue", { connection });

module.exports = { messageQueue };
