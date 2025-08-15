const OtherTask = require("../models/OtherTask");

function sumSessionsHours(sessions) {
  let ms = 0;
  for (const s of sessions) {
    if (s.from && s.to) ms += (new Date(s.to) - new Date(s.from));
  }
  return +(ms / 3600000).toFixed(2);
}

async function ensureNoOtherActive(userId, excludeTaskId = null) {
  const q = { assignee: userId, status: "In Progress" };
  if (excludeTaskId) q._id = { $ne: excludeTaskId };
  const existing = await OtherTask.findOne(q).lean();
  if (existing) {
    const err = new Error("Another task is already In Progress. Pause or complete it first.");
    err.code = "ACTIVE_EXISTS";
    throw err;
  }
}

module.exports = {
  sumSessionsHours,
  ensureNoOtherActive,
};
