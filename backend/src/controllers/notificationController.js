const Notification = require('../models/notificationModel');

// --- HELPER: Generate Messages from Data ---
const formatNotification = (note) => {
    // Convert Mongoose doc to standard JS object
    const n = note.toObject ? note.toObject() : note;

    let title = "Notification";
    let message = "You have a new update.";

    switch (n.type) {
        case 'budget_alert':
            title = "Budget Alert 🚨";
            message = `You have reached ${n.payload.percent}% of your limit (₹${n.payload.spent} / ₹${n.payload.limit}).`;
            break;
        case 'goal_milestone':
            title = "Goal Milestone 🏆";
            message = `Congratulations! You hit ${n.payload.percent}% of your goal.`;
            break;
        case 'bill_reminder':
            title = "Upcoming Bill 📅";
            message = `Reminder: Your bill for ₹${n.payload.amount} is due soon.`;
            break;
    }

    // Return the object WITH the new readable fields
    return { ...n, title, message };
};


exports.createNotification = async (req, res) => {
    try {
        const notification = await Notification.create({
            userId: req.userId,
            ...req.body,
        });

        res.json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.list = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const rawNotes = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100);

        // Transform raw data into readable messages
        const notes = rawNotes.map(formatNotification);

        res.json({ notes });
    } catch (error) {
        console.error("Notification List Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.unreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        // Assuming your schema has a 'read' field. If not, default to 0.
        const count = await Notification.countDocuments({ userId, read: false });
        res.json({ count });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.body; // Can be a single ID or 'all'
        const userId = req.userId;

        if (!id) return res.status(400).json({ error: "ID required" });

        if (id === 'all') {
            await Notification.updateMany(
                { userId },
                { $set: { read: true } }
            );
            return res.json({ message: "All marked as read" });
        }

        const note = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { $set: { read: true } }, // Use 'read', not 'sent'
            { new: true }
        );

        if (!note) return res.status(404).json({ error: "Notification not found" });

        res.json({ ok: true, note: formatNotification(note) });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        // Expect 'selectedIds' to be an array: ["64f...", "64e..."]
        const { selectedIds } = req.body;
        const userId = req.userId;

        // 1. Basic Validation
        if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
            return res.status(400).json({ error: "An array of selectedIds is required" });
        }

        // 2. Use deleteMany with the $in operator
        // This says: Delete any document where _id is IN the list AND userId matches
        const result = await Notification.deleteMany({
            _id: { $in: selectedIds },
            userId: userId
        });

        // 3. Check if anything was actually deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No notifications found to delete" });
        }

        // 4. Return success with count
        res.json({
            message: "Notifications deleted",
            deletedCount: result.deletedCount
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};