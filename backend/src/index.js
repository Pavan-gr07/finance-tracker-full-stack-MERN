require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');


const authRoutes = require("./routes/authRoutes");
const txnRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const goalRoutes = require("./routes/goalRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// 👇 ADD THIS LINE. IT IS REQUIRED FOR RENDER/VERCEL COOKIES
app.set('trust proxy', 1);

// Connect Mongo
(async () => {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected!");
})();

// app.use(cors({ origin: "*", credentials: true }));
const corsOptions = {
    origin: [
        "https://finance-tracker-full-stack-mern.vercel.app", // No trailing slash!
        "https://finance-tracker.pavangr.xyz",                // Your custom domain
        "http://localhost:3000"                               // Keep this for local testing
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", txnRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", analyticsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/user", userProfileRoutes);

app.get("/", (req, res) => {
    res.send("Finance Tracker API is running...");
});


app.get("/test-cookie", (req, res) => {
    res.cookie("testCookie", "hello123", {
        httpOnly: false
    });
    res.send("Cookie set");
});


// --- 3. THE MAGIC LINE: Start the Worker Here ---
// This tells Node to run the worker code alongside the server
// Make sure your worker.js exports nothing or just runs on load
require('./workers/budgetProcessor');
require('./workers/cron/recurringProcessor');
require('./workers/cron/smartNotifications');


app.listen(PORT, () => {
    console.log(`🚀 API Server running at port ${PORT}`);
});
