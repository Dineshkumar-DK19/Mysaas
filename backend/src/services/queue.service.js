// src/services/queue.service.js
const { messageQueue } = require("../workers/queue");

async function enqueueProcessInbound(messageId, businessId) {
    return messageQueue.add("processInbound", {
        messageId: messageId.toString(),
        businessId: businessId.toString()
      });

}

async function enqueueSendOutbound(messageId, businessId, toNumber, text) {
    return messageQueue.add("sendOutbound", {
        messageId: messageId.toString(),
        businessId: businessId.toString(),
        toNumber,
        text
      });

}

module.exports = { enqueueProcessInbound, enqueueSendOutbound };
