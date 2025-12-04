const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    settings: {
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'Asia/Kolkata' },
        notificationPrefs: { type: Object, default: { push: true, email: true } }
    }
}, { timestamps: true });


userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', userSchema);