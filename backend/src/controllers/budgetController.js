const Budget = require('../models/budgetModel');

exports.create = async (req, res) => {
    try {
        // Ensure userId is attached from middleware
        const payload = { ...req.body, userId: req.userId };

        const b = await Budget.create(payload);
        res.status(201).json({ budget: b });
    } catch (err) {
        console.error("Create Budget Error:", err);
        res.status(400).json({ error: err.message });
    }
};

exports.list = async (req, res) => {
    try {
        // FIX: Don't destructure. req.userId is the value.
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID is missing from request" });
        }

        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
        res.json({ budgets });
    } catch (err) {
        console.error("List Budgets Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Budget.findOneAndUpdate(
            { _id: id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Budget not found" });
        res.json({ budget: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Budget.findOneAndDelete({ _id: id, userId: req.userId });
        if (!deleted) return res.status(404).json({ error: "Budget not found" });
        res.json({ message: "Budget deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};