const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    payload: { type: Object },
    channels: { type: [String], default: ['in-app'] },
    sent: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model('Notification', notificationSchema);