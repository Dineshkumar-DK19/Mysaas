const Business = require("../models/Business.model");
const User = require("../models/User.model");
const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model");
const { upgradePlan, downgradePlan, getPlanDetails } = require("../services/billing.service");

exports.createBusiness = async (req, res, next) => {
  try {
    const { name, category } = req.body;

    if (!name)
      return res.status(400).json({ message: "Business name is required" });

    // Check if user already has a business
    if (req.user.business) {
      return res.status(400).json({
        message: "User already has a business. Use update endpoint instead."
      });
    }

    // Get user ID (handle both _id and id)
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // create business
    const business = await Business.create({
      owner: userId,
      name,
      category,
    });

    // attach business to user
    req.user.business = business._id;
    await req.user.save();

    res.json({
      message: "Business created successfully",
      business,
    });
  } catch (err) {
    console.error('Create business error:', err);
    // Provide more detailed error message
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Validation Error',
        errors: messages
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Business with this name already exists'
      });
    }
    next(err);
  }
};

exports.getMyBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business)
      return res.status(404).json({ message: "No business found" });

    res.json(business);
  } catch (err) {
    next(err);
  }
};


exports.getSettings = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.business);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business.settings);
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.business);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Validate aiTone if provided
    if (req.body.aiTone && !["friendly", "formal", "sales"].includes(req.body.aiTone)) {
      return res.status(400).json({ message: "Invalid aiTone. Must be 'friendly', 'formal', or 'sales'" });
    }

    // update only provided fields
    if (req.body.autoReply !== undefined) {
      business.settings.autoReply = req.body.autoReply;
    }

    if (req.body.aiTone) {
      business.settings.aiTone = req.body.aiTone;
    }

    if (req.body.fallbackMessage) {
      business.settings.fallbackMessage = req.body.fallbackMessage;
    }

    if (req.body.businessHours) {
      business.settings.businessHours = {
        ...business.settings.businessHours,
        ...req.body.businessHours,
      };
    }

    await business.save();

    res.json({
      message: "Settings updated",
      settings: business.settings,
    });
  } catch (err) {
    next(err);
  }
};

exports.addRules = async (req, res, next) => {
  try {
    const { keyword, reply, enabled } = req.body;
    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (!keyword || !reply) {
      return res.status(400).json({ message: "keyword and reply are required" });
    }

    business.rules.push({
      keyword,
      reply,
      enabled: enabled !== undefined ? enabled : true,
    });

    await business.save();

    res.json({ message: "Rule added", rules: business.rules });
  } catch (err) {
    next(err);
  }
};

exports.getRules = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.business);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business.rules || []);
  } catch (err) {
    next(err);
  }
};

exports.updateRule = async (req, res, next) => {
  try {
    const { ruleId } = req.params;
    const { keyword, reply, enabled } = req.body;
    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const rule = business.rules.id(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    if (keyword !== undefined) rule.keyword = keyword;
    if (reply !== undefined) rule.reply = reply;
    if (enabled !== undefined) rule.enabled = enabled;

    await business.save();

    res.json({ message: "Rule updated", rules: business.rules });
  } catch (err) {
    next(err);
  }
};

exports.deleteRule = async (req, res, next) => {
  try {
    const { ruleId } = req.params;
    const business = await Business.findById(req.user.business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const rule = business.rules.id(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    business.rules.pull(ruleId);
    await business.save();

    res.json({ message: "Rule deleted", rules: business.rules });
  } catch (err) {
    next(err);
  }
};



exports.getBusinessAnalytics = async (req, res, next) => {
  try {
    const businessId = req.user.business;

    if (!businessId) {
      return res.status(400).json({ message: "Business not found on user" });
    }

    const [conversations, messages, inbound, outbound] = await Promise.all([
      Conversation.countDocuments({ business: businessId }),
      Message.countDocuments({ business: businessId }),
      Message.countDocuments({ business: businessId, direction: "inbound" }),
      Message.countDocuments({ business: businessId, direction: "outbound" }),
    ]);

    res.json({
      conversations,
      messages,
      inbound,
      outbound,
    });
  } catch (err) {
    next(err);
  }
};




exports.getUsage = async (req, res, next) => {
  try {
    const businessId = req.user.business;

    const business = await Business.findById(businessId).select(
      "plan usage analytics"
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const LIMITS = {
      free: { messages: 500, aiReplies: 100 },
      pro: { messages: 10000, aiReplies: 5000 }
    };

    const planKey = (business.plan || "free").toLowerCase();
    const limits = LIMITS[planKey];

    if (!limits) {
      return res.status(400).json({ message: "Invalid plan" });
    }


    res.json({
      plan: business.plan,
      usage: business.usage,
      limits,
      analytics: business.analytics,
      remaining: {
        messages: limits.messages - business.usage.messagesThisMonth,
        aiReplies: limits.aiReplies - business.usage.aiRepliesThisMonth
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upgradePlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const businessId = req.user.business;

    if (!businessId) {
      return res.status(400).json({ message: "Business not found" });
    }

    if (!plan || !["free", "pro"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan. Must be 'free' or 'pro'" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // If upgrading, use upgradePlan; if downgrading, use downgradePlan
    const result = plan === "pro" && business.plan === "free"
      ? await upgradePlan(businessId, plan)
      : plan === "free" && business.plan === "pro"
      ? await downgradePlan(businessId, plan)
      : { message: "Plan unchanged", plan: business.plan, limits: getPlanDetails(business.plan).limits };

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPlanDetails = async (req, res, next) => {
  try {
    const businessId = req.user.business;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const details = getPlanDetails(business.plan);
    res.json(details);
  } catch (err) {
    next(err);
  }
};

exports.updateWhatsAppPhoneNumber = async (req, res, next) => {
  try {
    const { whatsappPhoneNumberId } = req.body;
    const businessId = req.user.business;

    if (!businessId) {
      return res.status(400).json({ message: "Business not found" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    business.whatsappPhoneNumberId = whatsappPhoneNumberId;
    await business.save();

    res.json({
      message: "WhatsApp phone number updated",
      whatsappPhoneNumberId: business.whatsappPhoneNumberId
    });
  } catch (err) {
    next(err);
  }
};