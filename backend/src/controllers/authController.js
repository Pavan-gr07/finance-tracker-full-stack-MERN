const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { generateToken } = require("../utils/jwt");
const { sendWelcomeEmail } = require('../services/mail-connect');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // 2. Hash password
        const hashed = await bcrypt.hash(password, 10);

        // 3. Create User
        const user = await User.create({
            name,
            email,
            password: hashed,
        });

        // 4. Generate Token
        const token = generateToken(user);

        // 5. Send Welcome Email (Asynchronous)
        // We don't await this because we don't want to make the user wait 
        // for the email to send before they get logged in.
        // It runs in the background.
        sendWelcomeEmail(user.email, user.name);

        // 6. Send Response
        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email }, // Don't send back the password!
            token
        });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
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

        // res.cookie("finance_token", token, {
        //     httpOnly: true,
        //     secure: true,        // Cookie only sent over HTTPS
        //     sameSite: 'none',
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // });
        res.status(200).json({
            message: "Login successful",
            token: token,
            user
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

