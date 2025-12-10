const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.logout = async (req, res) => {
    res.clearCookie("finance_token");
    res.json({ message: "Logged out" });
};


exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;
        const user = await User
            .findByIdAndUpdate(userId, updates, { new: true })
            .select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.userId; // Assumes your 'auth' middleware sets this

        // 1. Basic Validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both old and new passwords' });
        }

        // 2. Find User (explicitly select password if it's set to select: false in model)
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 3. Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        // 4. Prevent using the same password (Optional security measure)
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: 'New password cannot be the same as the old password' });
        }

        // 5. Hash the New Password
        // Note: If you have a 'pre-save' hook in your User model, you can just do:
        // user.password = newPassword; await user.save();
        // Otherwise, hash it manually here:
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 6. Save changes
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};