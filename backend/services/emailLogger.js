const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.CHAT_EMAIL_LOG_DIR || "D:/JS/scrum-tool/backend/chatEmailLogs";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function logLine(obj) {
  try {
    ensureDir(LOG_DIR);
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const file = path.join(LOG_DIR, `${yyyy}-${mm}-${dd}.log`);
    const line = JSON.stringify({ ts: date.toISOString(), ...obj }) + "\n";
    fs.appendFile(file, line, (err) => {
      if (err) console.error("[EmailLogger] append error:", err);
    });
  } catch (e) {
    console.error("[EmailLogger] fatal:", e);
  }
}

module.exports = { logLine };