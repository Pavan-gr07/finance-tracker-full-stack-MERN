const Notification = require('../models/notificationModel');

exports.list = async (req, res) => {
    try {
        const { userId } = req.query;

        // 1. Validation
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // 2. Database Query
        const notes = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100);

        // 3. Response
        res.json({ notes });

    } catch (error) {
        console.error('Notification List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.body;

        // 1. Validation
        if (!id) {
            return res.status(400).json({ error: 'Notification ID is required' });
        }

        // 2. Update Operation
        // distinct check: ensure the document actually exists
        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            { sent: true }, // Note: You are updating 'sent', ensure this matches your schema logic for 'read'
            { new: true }   // Returns the updated document instead of the old one
        );

        // 3. Check if not found
        if (!updatedNotification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // 4. Success Response
        res.json({ ok: true, notification: updatedNotification });

    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};