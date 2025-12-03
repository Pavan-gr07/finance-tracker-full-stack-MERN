const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },

    title: { type: String, required: true },
    description: { type: String },

    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },

    deadline: { type: Date, required: true },
    category: { type: String },

    status: {
        type: String,
        enum: ["active", "completed", "failed"],
        default: "active"
    },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Goal", goalSchema);
