const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { sign } = require('../utils/jwt');


exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'user exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash });
    const token = sign({ userId: user._id });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'invalid creds' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(400).json({ error: 'invalid creds' });
    const token = sign({ userId: user._id });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
};