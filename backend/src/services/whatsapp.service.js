// src/services/whatsapp.service.js
/**
 * whatsapp.service.js
 * - If WHATSAPP_TOKEN exists and you later configure Cloud API, implement sendText to call Meta.
 * - For now we simulate sending (logs only).
 */

const axios = require("axios");

async function sendTextReal(phoneNumberId, toNumber, text) {
  // placeholder for real WhatsApp Cloud API
  // implement when you have valid WHATSAPP_TOKEN and phoneNumberId
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || phoneNumberId;
  if (!token || !phoneId) throw new Error("WhatsApp token/phone id not configured");
  const cleanNumber = toNumber.replace(/\D/g, '');

  const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: cleanNumber,
    type: "text",
    text: { body: text },
  };

  const resp = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return resp.data;
}

async function sendText(toNumber, text, phoneNumberId = null) {
  // 1️⃣ If no token → simulation mode
  if (!process.env.WHATSAPP_TOKEN) {
    console.log(`[SIMULATION] WhatsApp send -> ${toNumber}: ${text}`);
    return { simulated: true, messageId: `sim_${Date.now()}` };
  }

  // 2️⃣ Real WhatsApp API call
  const phoneId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID missing in .env");
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  try {
    const res = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("META SEND SUCCESS:", res.data);
    return res.data;

  } catch (err) {
    console.error("META SEND ERROR:", err.response?.data || err.message);
    throw err;
  }
}
module.exports = { sendText, sendTextReal };
