const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
        });

        const token = generateToken(user);

        res.json({ user, token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ error: "Invalid password" });

        const token = generateToken(user);

        res.cookie("finance_token", token, {
            httpOnly: true,
            secure: false,  // true on HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ user });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

