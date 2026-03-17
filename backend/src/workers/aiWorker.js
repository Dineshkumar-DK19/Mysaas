require("dotenv").config();

const { connectDB } = require("../config/db");
connectDB().catch(console.error);

const { Worker } = require("bullmq");
const { connection } = require("../config/redis");

// Models
const Message = require("../models/Message.model");
const Business = require("../models/Business.model");

// Services
const { generateReply } = require("../services/ai.service");

console.log("🤖 AI Worker starting...");

const workerConnection = connection.duplicate();

// AI Worker for processing AI-related tasks
// This can be used for batch AI processing or separate AI queue if needed
const worker = new Worker(
  "aiQueue",
  async (job) => {
    try {
      const { name, data } = job;

      if (name === "generateReply") {
        const { messageId, prompt, businessId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          console.log(`⚠️ Message not found: ${messageId}`);
          return;
        }

        const business = await Business.findById(businessId);
        if (!business) {
          console.log(`⚠️ Business not found: ${businessId}`);
          return;
        }

        try {
          const reply = await generateReply(prompt);

          // Update message with AI reply if needed
          // This is a placeholder for future AI processing features
          console.log(`✅ AI reply generated for message ${messageId}`);

          return { reply, messageId };
        } catch (err) {
          console.error(`❌ AI generation failed for message ${messageId}:`, err.message);
          throw err;
        }
      }
    } catch (err) {
      console.error(`❌ AI Worker job error (${job.name}):`, err.message);
      throw err;
    }
  },
  { connection: workerConnection }
);

worker.on("ready", () => console.log("✅ AI Worker ready"));
worker.on("completed", (job) =>
  console.log(`✅ AI Job ${job.id} (${job.name}) completed`)
);
worker.on("failed", (job, err) =>
  console.error(`❌ AI Job ${job?.id} failed:`, err.message)
);

module.exports = worker;
