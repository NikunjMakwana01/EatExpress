const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Fail fast if SMTP is not configured.
  if (!host || !port || !user || !pass || pass.includes("your-app-password")) {
    throw new Error("SMTP email is not configured on the server.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: port === "465", // true for 465, false otherwise
    auth: {
      user,
      pass,
    },
  });

  return transporter.sendMail({
    from: user,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };

