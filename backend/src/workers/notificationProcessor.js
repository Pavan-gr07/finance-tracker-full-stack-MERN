require("dotenv").config();
const { Worker } = require("bullmq");
const redisClient = require("../config/redis");
const Notification = require("../models/notificationModel");
const connectDB = require("../config/db");

(async () => {
    await connectDB();

    const worker = new Worker(
        "notification-queue",
        async (job) => {
            const { notificationId } = job.data;

            const notification = await Notification.findById(notificationId);
            if (!notification) {
                console.log("Notification not found");
                return;
            }

            console.log(`Sending notification to user: ${notification.userId}`);

            // Future: integrate FCM / email provider here.

            notification.sent = true;
            await notification.save();
        },
        { connection: redisClient }
    );

    console.log("Notification Worker Running...");
})();
