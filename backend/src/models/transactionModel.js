// models/transactionModel.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // --- NEW FIELDS FOR RECURRING ---
    isRecurring: { type: Boolean, default: false },
    recurringConfig: {
        frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"] },
        nextRunDate: { type: Date }, // Crucial: When should we create the next copy?
        isActive: { type: Boolean, default: true }
    },
    parentTxnId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" } // To link copies back to original
});

module.exports = mongoose.model("Transaction", transactionSchema);