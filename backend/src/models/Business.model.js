const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    rules: [
      {
        keyword: { type: String, required: true },
        reply: { type: String, required: true },
        enabled: { type: Boolean, default: true },
      },
    ],

    analytics: {
      inboundCount: { type: Number, default: 0 },
      outboundCount: { type: Number, default: 0 },
      aiReplies: { type: Number, default: 0 },
      ruleReplies: { type: Number, default: 0 },
      lastActiveAt: { type: Date },
    },

    whatsappPhoneNumberId: { type: String },

    settings: {
      autoReply: { type: Boolean, default: true },
      aiTone: {
        type: String,
        enum: ["friendly", "formal", "sales"],
        default: "friendly",
      },
      businessHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },
      fallbackMessage: {
        type: String,
        default: "Thanks for contacting us. We'll get back to you shortly.",
      },
    },

    usage: {
      messagesThisMonth: { type: Number, default: 0 },
      aiRepliesThisMonth: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now },
      warned80: { type: Boolean, default: false },
      warned100: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
