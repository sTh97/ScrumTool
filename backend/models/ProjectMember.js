const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectMemberSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ["Admin", "Project Owner", "Project Lead", "Project Manager", "Manager", "Lead", "Team Member", "Observer"], default: 'Team Member' },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: false });

ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectMember', ProjectMemberSchema);
