const mongoose = require('mongoose');


const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String },
    limit: { type: Number, required: true },
    period: { type: String, enum: ['monthly', 'weekly', 'daily'], default: 'monthly' },
    startDate: { type: Date, default: Date.now },
    notifyAtPercent: { type: [Number], default: [50, 75, 90] }
}, { timestamps: true });


module.exports = mongoose.model('Budget', budgetSchema);