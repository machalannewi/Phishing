require("dotenv").config();
const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Email templates with versions
const templates = {
  welcome: {
    v1: {
      subject: "Welcome to Our Family! 🎉",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #eee; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hi there, ${recipient.name}! 👋</h1>
              <p style="font-size: 18px; margin: 10px 0;">Welcome to our family!</p>
            </div>
            <div class="content">
              <p>Hey ${recipient.name},</p>
              <p>We're so excited to have you here! You've just joined an amazing community of people who love what we do.</p>
              <p><strong>Here's what you can explore:</strong></p>
              <ul>
                <li>🎨 Customize your profile and make it yours</li>
                <li>🚀 Discover all our awesome features</li>
                <li>🤝 Connect with other amazing members</li>
                <li>💬 Join the conversation in our community</li>
              </ul>
              <p>Can't wait to see what you'll create with us!</p>
              <a href="#" class="button">Let's Get Started!</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p><a href="#">Unsubscribe</a> | <a href="#">Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    v2: {
      subject: "Welcome Aboard - Your Account is Ready",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
            .header { background: #34495e; color: white; padding: 40px; text-align: center; }
            .content { padding: 40px 30px; background: white; }
            .feature-box { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .button { display: inline-block; background: #3498db; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
            .footer { background: #34495e; color: #bdc3c7; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, ${recipient.name}</h1>
              <p>Your account has been successfully created</p>
            </div>
            <div class="content">
              <p>Dear ${recipient.name},</p>
              <p>Thank you for choosing our platform. We're excited to have you on board and look forward to helping you achieve your goals.</p>
              
              <h3>Getting Started:</h3>
              <div class="feature-box">
                <strong>1. Complete Your Profile</strong><br>
                Add your details to personalize your experience
              </div>
              <div class="feature-box">
                <strong>2. Explore Features</strong><br>
                Discover all the tools and resources available to you
              </div>
              <div class="feature-box">
                <strong>3. Access Support</strong><br>
                Our team is here 24/7 to assist you
              </div>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              <a href="#" class="button">Access Your Dashboard</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p><a href="#" style="color: #3498db;">Unsubscribe</a> | <a href="#" style="color: #3498db;">Contact Support</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
  },
  newsletter: {
    v1: {
      subject: "📰 This Week's Stories You'll Love",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Georgia, serif; line-height: 1.8; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
            .story { background: white; padding: 25px; margin: 20px 0; border-left: 4px solid #e74c3c; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .story h3 { color: #e74c3c; margin-top: 0; }
            .read-more { color: #e74c3c; text-decoration: none; font-weight: bold; }
            .footer { background: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📰 Your Weekly Digest</h1>
              <p>Curated stories just for you, ${recipient.name}</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px;">
              <p>Hi ${recipient.name},</p>
              <p>Here are the stories we think you'll enjoy this week...</p>
              
              <div class="story">
                <h3>The Future of Technology</h3>
                <p>Discover how emerging technologies are reshaping our world. From AI breakthroughs to sustainable innovations, this week has been full of exciting developments...</p>
                <a href="#" class="read-more">Read the full story →</a>
              </div>
              
              <div class="story">
                <h3>Community Success Story</h3>
                <p>Meet Sarah, who transformed her side project into a thriving business. Her journey is inspiring and full of valuable lessons for aspiring entrepreneurs...</p>
                <a href="#" class="read-more">Read the full story →</a>
              </div>
              
              <div class="story">
                <h3>Expert Tips & Insights</h3>
                <p>This week, our experts share their top strategies for productivity, creativity, and work-life balance. Don't miss these game-changing insights...</p>
                <a href="#" class="read-more">Read the full story →</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p><a href="#">Unsubscribe</a> | <a href="#">Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    v2: {
      subject: "📋 Your Weekly Update - Quick Digest",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3498db; color: white; padding: 30px; text-align: center; }
            .section { background: white; padding: 20px; margin: 15px 0; border: 1px solid #e0e0e0; }
            .section h4 { margin: 0 0 10px 0; color: #2c3e50; }
            .bullet { padding-left: 20px; }
            .bullet li { margin: 8px 0; }
            .footer { background: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Weekly Digest</h1>
              <p>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px;">
              <p>Hi ${recipient.name}, here's your weekly roundup:</p>
              
              <div class="section">
                <h4>🚀 Product Updates</h4>
                <ul class="bullet">
                  <li>New dashboard with improved analytics</li>
                  <li>Mobile app performance enhancements</li>
                  <li>Added dark mode support</li>
                </ul>
              </div>
              
              <div class="section">
                <h4>💡 Tips & Tricks</h4>
                <ul class="bullet">
                  <li>Keyboard shortcuts to boost productivity</li>
                  <li>How to organize your workspace</li>
                  <li>Best practices for team collaboration</li>
                </ul>
              </div>
              
              <div class="section">
                <h4>📊 This Week in Numbers</h4>
                <ul class="bullet">
                  <li>1,247 new community members</li>
                  <li>5,000+ projects created</li>
                  <li>98% user satisfaction rate</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p><a href="#">Unsubscribe</a> | <a href="#">Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
  },
  promotion: {
    v1: {
      subject: "⏰ URGENT: 25% OFF Ends Tonight!",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; }
            .urgent { background: #ff4444; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; }
            .offer { background: #fff3cd; border: 3px dashed #ffc107; padding: 30px; margin: 20px 0; text-align: center; }
            .code { background: #28a745; color: white; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 4px; display: inline-block; margin: 15px 0; }
            .timer { background: #dc3545; color: white; padding: 20px; text-align: center; font-size: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 18px 50px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 18px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="urgent">
              ⏰ HURRY! OFFER EXPIRES IN 12 HOURS
            </div>
            <div class="header">
              <h1>🔥 FLASH SALE 🔥</h1>
              <p style="font-size: 32px; margin: 10px 0; font-weight: bold;">25% OFF</p>
              <p style="font-size: 18px;">Everything Must Go!</p>
            </div>
            <div style="background: white; padding: 30px;">
              <p style="font-size: 16px;">Hi ${recipient.name},</p>
              <p style="font-size: 16px;"><strong>This is IT!</strong> Your exclusive discount is here, but time is running out FAST!</p>
              
              <div class="offer">
                <h2 style="margin-top: 0; color: #dc3545;">⚡ LIGHTNING DEAL ⚡</h2>
                <p style="font-size: 18px;"><strong>Use this code NOW:</strong></p>
                <div class="code">SAVE25</div>
                <p style="font-size: 14px; color: #666;">Copy this code and paste at checkout</p>
              </div>
              
              <div class="timer">
                ⏳ Ends: ${new Date(Date.now() + 12 * 60 * 60 * 1000).toLocaleString()}
              </div>
              
              <div style="text-align: center;">
                <a href="#" class="button">🛒 SHOP NOW BEFORE IT'S GONE</a>
              </div>
              
              <p style="text-align: center; color: #dc3545; font-weight: bold; margin-top: 20px;">
                Don't miss out ${recipient.name}! This deal won't last!
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p><a href="#">Unsubscribe</a> | <a href="#">Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    v2: {
      subject: "💰 Save 25% on Your Favorite Items",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
            .value-box { background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 15px 0; }
            .savings { background: #d4edda; border: 2px solid #28a745; padding: 25px; margin: 20px 0; text-align: center; border-radius: 10px; }
            .code { background: #007bff; color: white; padding: 12px 25px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block; margin: 10px 0; border-radius: 5px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Smart Savings</h1>
              <p style="font-size: 22px; margin: 10px 0;">Save 25% Today</p>
            </div>
            <div style="background: white; padding: 30px;">
              <p>Hi ${recipient.name},</p>
              <p>We value your loyalty, and we want to help you save on the products you love.</p>
              
              <div class="savings">
                <h2 style="margin-top: 0; color: #28a745;">Your Exclusive Discount</h2>
                <p><strong>Save 25% on your next purchase</strong></p>
                <div class="code">SAVE25</div>
                <p style="color: #666; font-size: 14px;">Valid until: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
              
              <div class="value-box">
                <strong>💎 What You Get:</strong>
                <ul>
                  <li>25% off your entire order</li>
                  <li>Free shipping on orders over $50</li>
                  <li>Easy returns within 30 days</li>
                </ul>
              </div>
              
              <div class="value-box">
                <strong>🎯 Popular Items:</strong>
                <ul>
                  <li>Premium Plan - Now $74.99 (was $99.99)</li>
                  <li>Starter Kit - Now $37.49 (was $49.99)</li>
                  <li>Pro Bundle - Now $149.99 (was $199.99)</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="#" class="button">Start Shopping & Save</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p><a href="#">Unsubscribe</a> | <a href="#">Preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
  },
  notification: {
    v1: {
      subject: "🔔 Quick Account Update",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #17a2b8; color: white; padding: 30px; text-align: center; }
            .alert { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Account Update</h1>
            </div>
            <div style="background: white; padding: 30px;">
              <p>Hi ${recipient.name},</p>
              
              <div class="alert">
                <strong>📋 Quick Update</strong><br>
                We've made some changes to your account that you should know about.
              </div>
              
              <p><strong>What changed:</strong></p>
              <ul>
                <li>✓ Security settings updated</li>
                <li>✓ Notification preferences saved</li>
                <li>✓ Profile information synced</li>
              </ul>
              
              <p>Everything is secure and working as expected.</p>
              
              <a href="#" class="button">View Account</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>This is an automated message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    v2: {
      subject: "⚠️ Important: Action Required on Your Account",
      getHtml: (recipient) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #856404; color: white; padding: 30px; text-align: center; }
            .warning { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .action-item { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .info-box { background: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Action Required</h1>
              <p>Important Account Notification</p>
            </div>
            <div style="background: white; padding: 30px;">
              <p>Dear ${recipient.name},</p>
              
              <div class="warning">
                <h3 style="margin-top: 0;">🔐 Security Alert</h3>
                <p>We've detected activity on your account that requires your immediate attention.</p>
              </div>
              
              <p><strong>Recent Activity Detected:</strong></p>
              
              <div class="action-item">
                <strong>1. New Device Login</strong><br>
                Location: Unknown<br>
                Time: ${new Date().toLocaleString()}<br>
                Status: Pending verification
              </div>
              
              <div class="action-item">
                <strong>2. Password Change Attempted</strong><br>
                Time: ${new Date(Date.now() - 3600000).toLocaleString()}<br>
                Status: Blocked for security
              </div>
              
              <div class="action-item">
                <strong>3. Email Settings Modified</strong><br>
                Changes: Notification preferences<br>
                Status: Review recommended
              </div>
              
              <div class="info-box">
                <strong>🛡️ What You Should Do:</strong>
                <ul style="margin: 10px 0;">
                  <li>Review your recent account activity</li>
                  <li>Verify all login locations</li>
                  <li>Update your password if needed</li>
                  <li>Enable two-factor authentication</li>
                </ul>
              </div>
              
              <p><strong>If this wasn't you:</strong> Please secure your account immediately by clicking the button below.</p>
              
              <div style="text-align: center;">
                <a href="#" class="button">Review Account Activity Now</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                If you did not perform these actions, please contact our security team immediately at security@company.com
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              <p>This is an automated security notification. Please do not reply to this email.</p>
              <p><a href="#">Security Center</a> | <a href="#">Contact Support</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
  },
};

// Parse CSV and return email list
async function parseCSV(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          email: data.email?.trim(),
          name: data.name?.trim() || "User",
        });
      })
      .on("end", () => {
        fs.unlinkSync(filePath);
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Send single email
async function sendEmail(recipient, template, version) {
  const templateData = templates[template][version];

  if (!templateData) {
    throw new Error(`Template ${template} version ${version} not found`);
  }

  const msg = {
    to: recipient.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: templateData.subject,
    html: templateData.getHtml(recipient),
  };

  try {
    await sgMail.send(msg);
    return { success: true, email: recipient.email };
  } catch (error) {
    console.error(`Failed to send to ${recipient.email}:`, error.message);
    return { success: false, email: recipient.email, error: error.message };
  }
}

// Send bulk emails with rate limiting
async function sendBulkEmails(recipients, template, version) {
  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const delayMs = 100;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];

    if (!recipient.email || !recipient.email.includes("@")) {
      results.failed++;
      results.errors.push({
        email: recipient.email,
        error: "Invalid email address",
      });
      continue;
    }

    const result = await sendEmail(recipient, template, version);

    if (result.success) {
      results.sent++;
      console.log(
        `✅ [${i + 1}/${recipients.length}] Sent to ${recipient.email}`
      );
    } else {
      results.failed++;
      results.errors.push({ email: recipient.email, error: result.error });
      console.log(
        `❌ [${i + 1}/${recipients.length}] Failed: ${recipient.email}`
      );
    }

    if (i < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// API Endpoints

// Upload and parse CSV
app.post("/api/upload-csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const recipients = await parseCSV(req.file.path);

    res.json({
      success: true,
      count: recipients.length,
      preview: recipients.slice(0, 5),
    });
  } catch (error) {
    console.error("CSV parsing error:", error);
    res.status(500).json({ error: "Failed to parse CSV file" });
  }
});

// Send campaign
app.post("/api/send-campaign", upload.single("file"), async (req, res) => {
  try {
    const { template, version } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!template || !templates[template]) {
      return res.status(400).json({ error: "Invalid template selected" });
    }

    if (!version || !templates[template][version]) {
      return res.status(400).json({ error: "Invalid version selected" });
    }

    const recipients = await parseCSV(req.file.path);

    if (recipients.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid recipients found in CSV" });
    }

    console.log(
      `Starting campaign: ${recipients.length} emails using ${template} template (${version})`
    );

    const results = await sendBulkEmails(recipients, template, version);

    console.log("Campaign completed:", results);

    res.json({
      success: true,
      results: results,
    });
  } catch (error) {
    console.error("Campaign error:", error);
    res.status(500).json({ error