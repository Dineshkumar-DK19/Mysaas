const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'admin'],
        default: 'owner'
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (pw) {
    return bcrypt.compare(pw, this.password);
};

module.exports = mongoose.model('User', userSchema);