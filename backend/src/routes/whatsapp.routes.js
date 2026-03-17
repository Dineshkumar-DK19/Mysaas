const express = require("express");
const auth = require("../middleware/auth.middleware");
const {
    testInboundSimulator,
    verifyWebhook,
    receiveWebhook
} = require("../controllers/whatsapp.controller");

const router = express.Router();

// TEST INBOUND (for local development)
// MUST call this: POST /api/whatsapp/test-inbound
router.post("/test-inbound", auth, testInboundSimulator);

// META WHATSAPP VERIFY WEBHOOK
router.get("/webhook", verifyWebhook);

// META WHATSAPP RECEIVE REAL INBOUND
router.post("/webhook", receiveWebhook);

module.exports = router;
