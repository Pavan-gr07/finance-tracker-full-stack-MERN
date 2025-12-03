const Notification = require('../models/notificationModel');


exports.list = async (req, res) => {
    const { userId } = req.query;
    const notes = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json({ notes });
};


exports.markRead = async (req, res) => {
    const { id } = req.body;
    await Notification.findByIdAndUpdate(id, { sent: true });
    res.json({ ok: true });
};