const Goal = require("../models/goalModel");


exports.createGoal = async (req, res) => {
    try {
        const goal = await Goal.create({
            userId: req.userId,
            ...req.body,
        });

        res.json(goal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.getGoal = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getSingleGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!goal) return res.status(404).json({ error: "Goal not found" });

        res.json(goal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateSingleGoal = async (req, res) => {
    try {
        const updated = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "Goal not found" });

        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteSingleGoal = async (req, res) => {
    try {
        const deleted = await Goal.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!deleted) return res.status(404).json({ error: "Goal not found" });

        res.json({ message: "Goal deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.addprogressToGoal = async (req, res) => {
    try {
        const { amount } = req.body;

        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!goal) return res.status(404).json({ error: "Goal not found" });

        goal.currentAmount += Number(amount);

        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = "completed";
        }

        await goal.save();

        res.json(goal);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


exports.goalSummary = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const summary = await Goal.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                }
            }
        ]);

        const totalGoals = summary.reduce((acc, s) => acc + s.count, 0);

        res.json({
            totalGoals,
            completed: summary.find((s) => s._id === "completed")?.count || 0,
            active: summary.find((s) => s._id === "active")?.count || 0,
            failed: summary.find((s) => s._id === "failed")?.count || 0,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}