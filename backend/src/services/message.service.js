// src/services/message.service.js
const Conversation = require("../models/Conversation.model");
const Message = require("../models/Message.model");
const {
  enqueueProcessInbound,
  enqueueSendOutbound
} = require("./queue.service");

/**
 * Find or create conversation
 */
async function findOrCreateConversation(
  businessId,
  customerNumber,
  customerName = null
) {
  let conv = await Conversation.findOne({
    business: businessId,
    customerNumber
  });

  if (!conv) {
    conv = await Conversation.create({
      business: businessId,
      customerNumber,
      customerName
    });
  }

  return conv;
}

/**
 * SAVE INBOUND MESSAGE (Customer → Business)
 */
async function saveInboundMessage(businessId, fromNumber, text, meta = {}) {
  const conv = await findOrCreateConversation(businessId, fromNumber);

  const msg = await Message.create({
    business: businessId,          // 🔥 REQUIRED
    conversation: conv._id,
    from: "customer",
    text,
    direction: "inbound",
    status: "received",
    meta
  });

  conv.lastMessageAt = new Date();
  await conv.save();

  // Queue AI / rule processing
  await enqueueProcessInbound(msg._id.toString(), businessId);

  return msg;
}

/**
 * SEND OUTBOUND MESSAGE (Dashboard / Manual)
 */
async function sendOutboundMessage(businessId, toNumber, text) {
  const conv = await findOrCreateConversation(businessId, toNumber);

  const msg = await Message.create({
    business: businessId,          // 🔥 REQUIRED
    conversation: conv._id,
    from: "business",
    text,
    direction: "outbound",
    status: "queued"
  });

  conv.lastMessageAt = new Date();
  await conv.save();

  // Queue WhatsApp sending
  await enqueueSendOutbound(
    msg._id.toString(),
    businessId,
    toNumber,
    text
  );

  return msg;
}

module.exports = {
  findOrCreateConversation,
  saveInboundMessage,
  sendOutboundMessage
};
