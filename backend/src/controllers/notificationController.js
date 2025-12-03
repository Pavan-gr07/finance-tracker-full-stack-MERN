const Notification = require('../models/notificationModel');

exports.list = async (req, res) => {
    try {
        const { userId } = req.query;
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

exports.markRead = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Notification ID is required' });
        }
        const updated = await Notification.findByIdAndUpdate(id, { sent: true });
        if (!updated) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};