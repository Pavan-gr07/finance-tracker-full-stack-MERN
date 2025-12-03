require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Budget = require("../models/Budget");
const bcrypt = require("bcryptjs");

(async () => {
    await connectDB();

    await User.deleteMany({});
    await Budget.deleteMany({});

    const hash = await bcrypt.hash("password", 10);

    const user = await User.create({
        name: "Pavan",
        email: "pavan@example.com",
        passwordHash: hash,
    });

    await Budget.create({
        userId: user._id,
        name: "Groceries",
        category: "Groceries",
        limit: 10000,
        period: "monthly",
        notifyAtPercent: [50, 75, 90],
    });

    console.log("Seed completed. User ID:", user._id.toString());
    process.exit(0);
})();
