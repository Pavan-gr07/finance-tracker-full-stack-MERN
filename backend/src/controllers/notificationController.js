const Notification = require('../models/notificationModel');

exports.list = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const notes = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
        res.json({ notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.read = async (req, res) => {
    try {
        const userId = req.userId;
        const notes = await Notification.find({ userId, sent: true })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ count: notes.length, notes });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.unreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        const count = await Notification.countDocuments({ userId, sent: false });
        res.json({ count });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

exports.markRead = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: "id required" });

        const note = await Notification.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { sent: true },
            { new: true }
        );

        if (!note) return res.status(404).json({ error: "Notification not found" });
        res.json({ ok: true, note });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}