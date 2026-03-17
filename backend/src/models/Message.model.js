const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    from: {
        type: String,
        enum: ['customer', 'business', 'system'],
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    media: {
        type: Object,
        default: null
    }, // {url, mime, id}
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    },
    status: {
        type: String,
        enum: ['received', 'queued', 'sent', 'delivered', 'failed'],
        default: 'received'
    },
    meta: {
        type: Object,
        default: {}
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);