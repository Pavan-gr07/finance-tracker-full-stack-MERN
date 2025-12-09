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

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Mongo
(async () => {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected!");
})();

// app.use(cors({ origin: "*", credentials: true }));
const corsOptions = {
    // 1. You MUST specify the exact Frontend URL here
    //    If you deploy, change this to your production domain.
    origin: 'http://localhost:3000',

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

    // 2. This allows the browser to send/receive the HttpOnly cookie
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

app.get("/", (req, res) => {
    res.send("Finance Tracker API is running...");
});


app.get("/test-cookie", (req, res) => {
    res.cookie("testCookie", "hello123", {
        httpOnly: false
    });
    res.send("Cookie set");
});


app.listen(PORT, () => {
    console.log(`🚀 API Server running at port ${PORT}`);
});
