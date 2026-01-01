const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectCharterSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  purpose: { type: String, required: true },
  scope: { type: String, required: true },
  objectives: [{ type: String }],
  risks: [{ type: String }],
  assumptions: [{ type: String }],
  approvers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('ProjectCharter', ProjectCharterSchema);
