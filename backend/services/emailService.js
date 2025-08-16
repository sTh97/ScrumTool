const nodemailer = require("nodemailer");
const { logLine } = require("./emailLogger");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "mail.3em.tech",
  port: Number(process.env.MAIL_PORT || 587),
  secure: false, // STARTTLS on 587
  auth: {
    user: process.env.MAIL_USER || "kuldeep.kumar@3em.tech",
    pass: process.env.MAIL_PASS || "ahJegBGUnKj7",
  },
});

async function sendIntimation({ to, subject, html, meta }) {
  const payload = { from: process.env.MAIL_USER || "kuldeep.kumar@3em.tech", to, subject, html };
  const startedAt = Date.now();
  try {
    const info = await transporter.sendMail(payload);
    logLine({ level: "info", event: "email_sent", to, subject, messageId: info.messageId, meta, durationMs: Date.now() - startedAt });
    return { ok: true, info };
  } catch (err) {
    logLine({ level: "error", event: "email_error", to, subject, error: err?.message, stack: err?.stack, meta, durationMs: Date.now() - startedAt });
    return { ok: false, error: err };
  }
}

module.exports = { sendIntimation };