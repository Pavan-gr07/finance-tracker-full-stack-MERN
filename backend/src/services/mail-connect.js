// services/emailService.js
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

// 1. Configure the Transport (Do this once)
// Make sure to put your actual Token in your .env file
const TOKEN = process.env.MAILTRAP_TOKEN || "<YOUR_API_TOKEN>";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const SENDER = {
  address: "support@pavangr.xyz", // Or your verified sender
  name: "Finance Tracker",
};

/**
 * 2. Generic Send Function
 * This function is dynamic. You can pass any 'to', 'subject', or 'html' content to it.
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transport.sendMail({
      from: SENDER,
      to: [to], // Mailtrap expects an array
      subject: subject,
      html: htmlContent, // We use 'html' instead of 'text' for nice formatting
      category: "Finance Tracker Notification",
    });

    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow so the controller knows if it failed
  }
};

/**
 * 3. Specific Template: Welcome Email
 * This constructs the HTML dynamically based on the user's name.
 */
exports.sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to Finance Tracker!";

  // Success Green Color (Change to #ff9800 if you want it Orange like the alert)
  const themeColor = "#4CAF50";
  const lightBg = "#e8f5e9";

  // Welcome Icon
  const iconUrl = "https://cdn-icons-png.flaticon.com/512/1000/1000997.png"; // User/Welcome Icon

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Shared Styles (Same as Budget Alert) */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background-color: ${themeColor}; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; color: #333333; }
        .info-box { background-color: ${lightBg}; border-left: 5px solid ${themeColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${themeColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999999; background-color: #f4f4f4; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          
          <div class="header">
             <h2 style="color: #ffffff; margin: 10px 0 0 0;">Welcome Aboard!</h2>
          </div>

          <div class="content">
            <p>Hi ${name},</p>
            
            <p>Thank you for joining <strong>Finance Tracker</strong>. We are excited to help you take control of your financial journey.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Your account is ready.</strong></p>
              <p style="margin: 5px 0 0 0;">You can now start adding transactions, setting budgets, and visualizing your spending.</p>
            </div>

            <p>Click the button below to log in and add your first expense.</p>

            <center>
              <a href="https://finance-tracker.pavangr.xyz/login" class="button">Get Started</a>
            </center>
          </div>

          <div class="footer">
            <p>Finance Tracker App<br>
            <a href="#" style="color: #999; text-decoration: none;">Contact Support</a>
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

exports.sendBudgetAlert = async (email, name, budgetName, spentAmount, limitAmount) => {
  // Calculate percentage for the email text
  const percentage = Math.round((spentAmount / limitAmount) * 100);

  // Dynamic Subject
  const subject = `⚠️ Alert: You've reached ${percentage}% of your ${budgetName} budget`;

  // Public URL for a warning icon (or use your own logo)
  const iconUrl = "https://cdn-icons-png.flaticon.com/512/1008/1008928.png"; // Generic warning icon

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Basic reset for email clients */
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background-color: #ff9800; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; color: #333333; }
        .alert-box { background-color: #fff3e0; border-left: 5px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ff9800; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999999; background-color: #f4f4f4; }
        .amount { font-weight: bold; color: #d32f2f; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          
          <div class="header">
             <img src="${iconUrl}" alt="Warning" style="width: 50px; height: 50px; display: block; margin: 0 auto;">
             <h2 style="color: #ffffff; margin: 10px 0 0 0;">Budget Alert</h2>
          </div>

          <div class="content">
            <p>Hi ${name},</p>
            
            <p>This is a notification that you have exceeded the threshold for your <strong>${budgetName}</strong> budget.</p>

            <div class="alert-box">
              <p style="margin: 5px 0;"><strong>Budget Limit:</strong> $${limitAmount}</p>
              <p style="margin: 5px 0;"><strong>Current Spend:</strong> <span class="amount">$${spentAmount}</span></p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${percentage}% Used</p>
            </div>

            <p>We recommend reviewing your recent transactions to stay on track.</p>

            <center>
              <a href="https://finance-tracker.pavangr.xyz/dashboard" class="button">View Dashboard</a>
            </center>
          </div>

          <div class="footer">
            <p>Finance Tracker App<br>
            <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe from alerts</a>
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  // Reuse your generic sendEmail function
  return await sendEmail(email, subject, html);
};