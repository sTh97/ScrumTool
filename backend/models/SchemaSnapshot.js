const mongoose = require('mongoose');
const SchemaSnapshotSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, default: '' }, // optional label like UAT / Prod
  side: { type: String, enum: ['left', 'right', ''], default: '' },
  fileName: { type: String, required: true },
  format: { type: String, enum: ['sql', 'json'], required: true },
  schemaJson: { type: Object, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
SchemaSnapshotSchema.index({ name: 'text', fileName: 'text' });
SchemaSnapshotSchema.index({ project: 1, createdAt: -1 });
module.exports = mongoose.model('SchemaSnapshot', SchemaSnapshotSchema);