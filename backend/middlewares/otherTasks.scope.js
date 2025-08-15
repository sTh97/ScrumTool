// backend/middleware/otherTasks.scope.js
const isRole = (req, names) => {
  const roles = (req.user?.roles || []).map(r => (typeof r === "string" ? r : r.name));
  return names.some(n => roles.includes(n));
};

function buildScopeFilter(req) {
  const adminOrPM = isRole(req, ["Admin", "System Administrator", "Project Manager"]);
  const sps = isRole(req, ["Senior Project Supervisor"]);
  const me = req.user?.id;

  if (adminOrPM) return {}; // full view
  if (sps) return { $or: [{ assignee: me }, { assignedBy: me }] };
  return { assignee: me };
}

module.exports = { buildScopeFilter, isRole };
