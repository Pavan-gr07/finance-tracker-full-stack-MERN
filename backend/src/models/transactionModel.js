// models/transactionModel.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },

    // --- 🔗 GOAL LINKING (New) ---
    // Only used if type='expense' (transfer to savings) or 'income'
    linkedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", default: null },
    linkedBudgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", default: null },

    // --- 🔄 RECURRING CONFIG ---
    isRecurring: { type: Boolean, default: false },
    recurringConfig: {
        frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"] },
        nextRunDate: { type: Date },
        isActive: { type: Boolean, default: true }
    },
    parentTxnId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }
}, { timestamps: true });


module.exports = mongoose.model("Transaction", transactionSchema);