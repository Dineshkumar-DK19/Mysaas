require("dotenv").config();

const { connectDB } = require("../config/db");
connectDB().catch(console.error);

const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
const { messageQueue } = require("./queue");

// Models
require("../models/Conversation.model");
const Business = require("../models/Business.model");
const Message = require("../models/Message.model");

// Services
const { matchRule } = require("../services/ruleMatcher");
const { sendText } = require("../services/whatsapp.service");
const { generateReply } = require("../services/ai.service");
const { resetUsageIfNeeded } = require("../services/usage.service");
const { checkUsageWarnings } = require("../services/usageWarning.services");

console.log("🚀 Message Worker starting...");

const workerConnection = connection.duplicate();

const PLAN_LIMITS = {
  free: { messages: 500, aiReplies: 100 },
  pro: { messages: 10000, aiReplies: 5000 },
};

const worker = new Worker(
  "messageQueue",
  async (job) => {
    try {
      const { name, data } = job;

      /* ================= INBOUND ================= */
      if (name === "processInbound") {
        const { messageId, businessId } = data;

        const msg = await Message.findById(messageId).populate("conversation");
        if (!msg || !msg.conversation) {
          console.log(`⚠️ Message or conversation not found: ${messageId}`);
          return;
        }

        const business = await Business.findById(businessId);
        if (!business) {
          console.log(`⚠️ Business not found: ${businessId}`);
          return;
        }

      resetUsageIfNeeded(business);

      const limits = PLAN_LIMITS[business.plan || "free"];

      // HARD STOP
      if (business.usage.messagesThisMonth >= limits.messages) {
        console.log("🚫 Monthly message limit reached");
        return;
      }

      let reply;
      let replyType = "ai";
      const prompt = `Customer: ${msg.text}\nReply in short helpful tone.`;

      const rule = matchRule(msg.text, business.rules || []);
      if (rule) {
        reply = rule.reply;
        replyType = "rule";
      } else {
        if (business.usage.aiRepliesThisMonth >= limits.aiReplies) {
          reply = "⚠️ You’ve reached your AI reply limit for this month.";
          replyType = "limit";
        } else {
          try {
            reply = await generateReply(prompt);
            business.usage.aiRepliesThisMonth += 1;
          } catch {
            reply =
              business.settings?.fallbackMessage ||
              "Sorry, I am busy right now.";
            replyType = "fallback";
          }
        }
      }

      business.usage.messagesThisMonth += 1;

      if (!business.analytics) {
        business.analytics = {
          inboundCount: 0,
          outboundCount: 0,
          aiReplies: 0,
          ruleReplies: 0,
        };
      }

      business.analytics.inboundCount += 1;
      business.analytics.lastActiveAt = new Date();

      if (replyType === "ai") business.analytics.aiReplies += 1;
      if (replyType === "rule") business.analytics.ruleReplies += 1;

      const warning = checkUsageWarnings(business, limits);
      if (warning) console.log("📢", warning);

      await business.save();

      if (business.settings && !business.settings.autoReply) return;

      const outbound = await Message.create({
        business: businessId,
        conversation: msg.conversation._id,
        from: "business",
        text: reply,
        direction: "outbound",
        status: "queued",
      });

      business.analytics.outboundCount += 1;
      await business.save();

      await messageQueue.add("sendOutbound", {
        messageId: outbound._id.toString(),
        toNumber: msg.conversation.customerNumber,
        text: reply,
        businessId,
      });
    }

      /* ================= OUTBOUND ================= */
      if (name === "sendOutbound") {
        const { messageId, toNumber, text } = data;

        try {
          let result;
          if (!process.env.WHATSAPP_TOKEN) {
            console.log(`[SIM] WhatsApp → ${toNumber}: ${text}`);
            result = { simulated: true, messageId: `sim_${Date.now()}` };
          } else {
            result = await sendText(toNumber, text);
          }

          // Store WhatsApp message ID for status tracking
          const updateData = {
            status: "sent",
            meta: {
              ...(result.messages?.[0]?.id && { whatsappMessageId: result.messages[0].id }),
              sentAt: new Date()
            }
          };

          await Message.findByIdAndUpdate(messageId, updateData);
        } catch (err) {
          await Message.findByIdAndUpdate(messageId, {
            status: "failed",
            meta: { error: err.message, failedAt: new Date() },
          });
        }
      }
    } catch (err) {
      console.error(`❌ Worker job error (${job.name}):`, err.message);
      throw err; // Re-throw to let BullMQ handle retries
    }
  },
  { connection: workerConnection }
);

worker.on("ready", () => console.log("✅ Worker ready"));
worker.on("completed", (job) =>
  console.log(`✅ Job ${job.id} (${job.name}) completed`)
);
worker.on("failed", (job, err) =>
  console.error(`❌ Job ${job?.id} failed:`, err.message)
);

module.exports = worker;
