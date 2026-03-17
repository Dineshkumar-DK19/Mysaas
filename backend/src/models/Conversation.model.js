const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },
        customerNumber: {
            type: String,
            required: true
        },
        customerName: {
            type: String,
            default: null
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
