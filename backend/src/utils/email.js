const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/*
 * Sends a transactional email. Fails silently (logs only) in development
   if SMTP credentials aren't configured yet, so auth flows aren't blocked
   while you're still wiring up email.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[email] SMTP not configured — skipping send to ${to}: "${subject}"`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const otpEmailTemplate = (name, otp) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
    <h2 style="color:#1e66f5;">PharmaCare</h2>
    <p>Hi ${name},</p>
    <p>Your verification code is:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otp}</p>
    <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

const resetPasswordEmailTemplate = (name, resetUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
    <h2 style="color:#1e66f5;">PharmaCare</h2>
    <p>Hi ${name},</p>
    <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
    <p><a href="${resetUrl}" style="color:#1e66f5;">Reset your password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

module.exports = { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate };
