// src/controllers/emailReportController.js
import { getDatabase } from "../../init/db.init.js";
import nodemailer from "nodemailer";
import { Parser } from "json2csv";
import emailConfig from "../config/email.config.js";

// Initialize the transporter outside of the request handlers but wrap it in a function
// to prevent immediate connection attempts during module loading
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
};

// Create transporter with error handling
const createTransporter = () => {
  try {
    return nodemailer.createTransport(emailConfig);
  } catch (error) {
    console.error("Error creating mail transporter:", error);
    throw error;
  }
};

// Method: Send checkout report via email
export const sendCheckoutReport = async (req, res) => {
  const { timestamp, email } = req.body;

  if (!timestamp || !email) {
    return res
      .status(400)
      .send("Both timestamp and email parameters are required");
  }

  let transporter;
  try {
    transporter = createTransporter();
  } catch (error) {
    console.error("Failed to create email transporter:", error);
    return res.status(500).json({
      message: "Email configuration error",
      error: error.message,
    });
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT 
        p.project_number,
        i.sku AS item_sku,
        i.name AS item_name,
        SUM(c.quantity) AS total_quantity
      FROM 
        checkouts c
      JOIN 
        projects p ON c.project_id = p.project_id
      JOIN 
        items i ON c.item_id = i.item_id
      WHERE 
        c.timestamp >= ?
      GROUP BY 
        p.project_number, i.sku, i.name
      ORDER BY 
        p.project_number, i.sku, i.name`
      )
      .all(timestamp);

    if (rows.length === 0) {
      return res
        .status(404)
        .send("No data found for the specified time period");
    }

    const fields = [
      "project_number",
      "item_sku",
      "item_name",
      "total_quantity",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    const mailOptions = {
      from: emailConfig.defaults.from,
      to: email,
      subject: "Cable Audit System - Checkout Report",
      text: `Please find attached the checkout report for data after ${timestamp}`,
      attachments: [
        {
          filename: `checkout-report-${timestamp.split(" ")[0]}.csv`,
          content: csv,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Report sent successfully",
      timestamp: timestamp,
      recipient: email,
      total_records: rows.length,
    });
  } catch (error) {
    console.error("Error in sendCheckoutReport:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Method: Test email configuration
export const testEmailConfig = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email parameter is required");
  }

  try {
    const mailTransporter = getTransporter();
    const testMailOptions = {
      from: emailConfig.from,
      to: email,
      subject: "Cable Audit System - Email Configuration Test",
      text: "This is a test email from the Cable Audit System. If you receive this, the email configuration is working correctly.",
    };

    await mailTransporter.sendMail(testMailOptions);

    res.status(200).json({
      message: "Test email sent successfully",
      recipient: email,
    });
  } catch (error) {
    console.error("Error in testEmailConfig:", error);
    res.status(500).json({
      message: "Failed to send test email",
      error: error.message,
    });
  }
};
