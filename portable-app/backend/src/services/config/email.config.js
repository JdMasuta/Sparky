// src/config/email.config.js
const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    service: "gmail", // Using Gmail service instead of direct SMTP config
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-specific-password",
    },
    defaults: {
      from:
        process.env.EMAIL_FROM || '"Cable Audit System" <your-email@gmail.com>',
    },
  },

  test: {
    service: "gmail",
    auth: {
      user: process.env.TEST_EMAIL_USER || "test@gmail.com",
      pass: process.env.TEST_EMAIL_PASS || "test-password",
    },
    defaults: {
      from:
        process.env.TEST_EMAIL_FROM ||
        '"Cable Audit System Test" <test@gmail.com>',
    },
  },

  production: {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    defaults: {
      from: process.env.SMTP_FROM,
    },
  },
};

export default config[env];
