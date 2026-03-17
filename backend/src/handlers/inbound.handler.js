const { saveInboundMessage } = require("../services/message.service");

async function handleInbound(businessId, from, text) {
    return await saveInboundMessage(businessId, from, text);
}

module.exports = { handleInbound };
