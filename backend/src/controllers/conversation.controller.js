const Conversation = require("../models/Conversation.model");
const Message = require("../models/Message.model");

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      business: req.user.business,
    })
      .sort({ lastMessageAt: -1 })
      .populate({
        path: 'business',
        select: 'name plan'
      });

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await Message.countDocuments({
          conversation: conv._id
        });
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          from: 'customer',
          status: 'received'
        });

        const convObj = conv.toObject();
        convObj.messageCount = messageCount;
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    res.json(conversationsWithCounts);
  } catch (err) {
    next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('business', 'name plan');

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.business._id.toString() !== req.user.business.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: 1 });

    const messageCount = messages.length;
    const unreadCount = await Message.countDocuments({
      conversation: conversationId,
      from: 'customer',
      status: 'received'
    });

    res.json({
      ...conversation.toObject(),
      messages,
      messageCount,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify conversation belongs to user's business
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.business.toString() !== req.user.business.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Send an outbound message (dashboard triggered)
exports.sendMessage = async (req, res, next) => {
  try {
    const { toNumber, text } = req.body;
    const businessId = req.user.business;

    if (!toNumber || !text) {
      return res.status(400).json({ message: "toNumber and text are required" });
    }

    if (!businessId) {
      return res.status(400).json({ message: "Business not found" });
    }

    const { sendOutboundMessage } = require("../services/message.service");
    const message = await sendOutboundMessage(businessId, toNumber, text);

    res.json({
      message: "Message queued successfully",
      data: message
    });
  } catch (err) {
    next(err);
  }
};

// Simulate inbound message for testing
exports.receiveTestInbound = async (req, res, next) => {
  try {
    const { from, text } = req.body;
    const businessId = req.user.business;

    if (!from || !text) {
      return res.status(400).json({ message: "from and text are required" });
    }

    if (!businessId) {
      return res.status(400).json({ message: "Business not found" });
    }

    const { saveInboundMessage } = require("../services/message.service");
    const message = await saveInboundMessage(businessId, from, text);

    res.json({
      message: "Test inbound message received",
      data: message
    });
  } catch (err) {
    next(err);
  }
};
