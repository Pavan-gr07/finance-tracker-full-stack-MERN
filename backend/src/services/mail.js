// services/emailService.js
const { Resend } = require('resend');

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendWelcomeEmail = async (email, name) => {
    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Step 1: Use this sender
            to: [email],                   // Step 2: Ensure this is YOUR email
            subject: 'Welcome to Finance Tracker!',
            html: `<h1>Hello ${name}</h1><p>Welcome!</p>`
        });

        // Step 3: Check this log in your terminal
        console.log("Resend API Response:", data);

    } catch (error) {
        console.error("Resend Error:", error);
    }
};