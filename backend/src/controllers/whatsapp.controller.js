const { saveInboundMessage } = require("../services/message.service");

// ------------------------------------
// 1️⃣ LOCAL TEST SIMULATOR
// ------------------------------------
exports.testInboundSimulator = async (req, res, next) => {
    try {
        const businessId = req.user.business;
        const { from, text } = req.body;

        if (!from || !text) {
            return res.status(400).json({ message: "from & text required" });
        }

        const saved = await saveInboundMessage(businessId, from, text);

        return res.json({
            message: "Simulated inbound stored successfully",
            data: saved
        });

    } catch (err) {
        next(err);
    }
};

// ------------------------------------
// 2️⃣ META VERIFY
// ------------------------------------
exports.verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
};

// ------------------------------------
// 3️⃣ META RECEIVE INBOUND
// ------------------------------------

const Business = require("../models/Business.model"); // Import Business model

// ... keep testInboundSimulator and verifyWebhook as they are ...

exports.receiveWebhook = async (req, res, next) => {
    try {
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messageObj = value?.messages?.[0];
        const statusObj = value?.statuses?.[0];
        const metadata = value?.metadata;

        const phoneNumberId = metadata?.phone_number_id;

        // Find business by the phone number ID from the webhook
        const business = await Business.findOne({ whatsappPhoneNumberId: phoneNumberId });

        if (!business) {
            console.log("⚠️ Ignored: No business found for phone_number_id:", phoneNumberId);
            return res.sendStatus(200);
        }

        // Handle message status updates (sent, delivered, read, failed)
        if (statusObj) {
            const Message = require("../models/Message.model");
            const { id: messageId, status: whatsappStatus, recipient_id } = statusObj;

            // Find message by WhatsApp message ID stored in meta
            const message = await Message.findOne({
                business: business._id,
                "meta.whatsappMessageId": messageId
            });

            if (message) {
                // Map WhatsApp status to our status
                const statusMap = {
                    sent: "sent",
                    delivered: "delivered",
                    read: "delivered", // We don't track read separately
                    failed: "failed"
                };

                const newStatus = statusMap[whatsappStatus] || message.status;
                await Message.findByIdAndUpdate(message._id, {
                    status: newStatus,
                    "meta.deliveryStatus": whatsappStatus,
                    "meta.deliveryTimestamp": new Date()
                });

                console.log(`📊 Status update: ${whatsappStatus} for message ${messageId}`);
            }

            return res.sendStatus(200);
        }

        // Handle inbound messages
        if (messageObj) {
            const from = messageObj.from;
            const text = messageObj.text?.body || null;
            const messageId = messageObj.id;

            console.log(`📩 Real Inbound from ${from} to Business ${business.name}`);

            const saved = await saveInboundMessage(business._id, from, text, {
                whatsappMessageId: messageId,
                timestamp: messageObj.timestamp
            });

            return res.sendStatus(200);
        }

        // If it's neither message nor status, just acknowledge
        res.sendStatus(200);
    } catch (err) {
        console.error("Webhook Error:", err);
        next(err);
    }
};
